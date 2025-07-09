"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

function noop() {}

export type ScrollPosition = "start" | "middle" | "end";

export type CarouselContextObject = {
  carouselCount: number;
  currentCarousel: number;
  loop: boolean;
  setCurrentCarousel: (carousel: number) => void;
  handleScroll: () => void;
  scrollToNext: () => void;
  scrollToPrevious: () => void;
  scrollPosition: ScrollPosition;
};

/**
 * Ref - https://iykethe1st.hashnode.dev/a-react-ref-adventure-creating-a-smooth-scrolling-carousel-using-react-and-tailwind-css
 */
export function useCarousel(carouselCount: number, loop = true) {
  const sliderItemsRef = useRef<HTMLElement>(null);
  const [currentCarousel, setCurrentCarousel] = useState(0);
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>("start");

  const prev = useCallback(() => {
    setCurrentCarousel((currentCarousel) => {
      const isFirstCarousel = currentCarousel === 0;
      if (isFirstCarousel && loop) {
        return carouselCount - 1;
      }

      if (isFirstCarousel && !loop) {
        return currentCarousel;
      }

      return --currentCarousel;
    });
  }, [carouselCount, loop]);

  const next = useCallback(() => {
    setCurrentCarousel((currentCarousel) => {
      const isLastCarousel = currentCarousel === carouselCount - 1;
      if (isLastCarousel && loop) {
        return 0;
      }

      if (isLastCarousel && !loop) {
        return currentCarousel;
      }

      return ++currentCarousel;
    });
  }, [carouselCount, loop]);

  const handleScroll = useCallback<
    CarouselContextObject["handleScroll"]
  >(() => {
    const container = sliderItemsRef.current;
    if (!container) {
      return;
    }

    const { scrollLeft, offsetWidth, scrollWidth } = container;
    const maxScroll = scrollWidth - offsetWidth;
    let position: ScrollPosition = "start";

    if (scrollLeft > 0) {
      position = "middle";
    }

    if (scrollLeft === maxScroll) {
      position = "end";
    }

    setScrollPosition(position);
  }, []);

  const scrollToPrevious = useCallback<
    CarouselContextObject["scrollToPrevious"]
  >(() => {
    prev();

    const container = sliderItemsRef.current;
    if (!container) {
      return;
    }

    const isFirstCarousel = currentCarousel === 0;
    let nextScrollLeft = container.scrollLeft - container.offsetWidth;
    if (isFirstCarousel && loop) {
      nextScrollLeft = container.offsetWidth * carouselCount - 1;
    }

    container.scrollTo({
      left: nextScrollLeft,
      behavior: "smooth",
    });
  }, [currentCarousel, carouselCount, loop, prev]);

  const scrollToNext = useCallback<
    CarouselContextObject["scrollToNext"]
  >(() => {
    next();

    const container = sliderItemsRef.current;
    if (!container) {
      return;
    }

    const isLastCarousel = currentCarousel === carouselCount - 1;
    let nextScrollLeft = container.scrollLeft + container.offsetWidth;
    if (isLastCarousel && loop) {
      nextScrollLeft = 0;
    }

    container.scrollTo({
      left: nextScrollLeft,
      behavior: "smooth",
    });
  }, [currentCarousel, carouselCount, loop, next]);

  return {
    sliderItemsRef,
    currentCarousel,
    setCurrentCarousel,
    scrollToPrevious,
    scrollToNext,
    scrollPosition,
    setScrollPosition,
    handleScroll,
  };
}

export const CarouselContext = createContext<CarouselContextObject>({
  carouselCount: 0,
  currentCarousel: 0,
  loop: true,
  setCurrentCarousel: noop,
  scrollToNext: noop,
  scrollToPrevious: noop,
  scrollPosition: "start",
  handleScroll: noop,
});

const CarouselItemsContext =
  createContext<React.RefObject<HTMLElement | null> | null>(null);

export type CarouselProps<TAs extends React.ElementType> = {
  as?: TAs;
  carouselCount?: number;
  loop?: boolean;
};

export function Carousel<TAs extends React.ElementType = "div">({
  as: asProp,
  children,
  id,
  carouselCount = 0,
  loop = true,
  ...restProps
}: CarouselProps<TAs> & React.ComponentPropsWithoutRef<TAs>) {
  const Component = asProp || "div";
  const {
    currentCarousel,
    setCurrentCarousel,
    sliderItemsRef,
    scrollToNext,
    scrollToPrevious,
    handleScroll,
    scrollPosition,
  } = useCarousel(carouselCount, loop);

  return (
    <CarouselContext.Provider
      value={{
        carouselCount,
        currentCarousel,
        loop,
        setCurrentCarousel,
        scrollToNext,
        scrollToPrevious,
        handleScroll,
        scrollPosition,
      }}
    >
      <CarouselItemsContext.Provider value={sliderItemsRef}>
        <Component id={id} {...restProps}>
          {children}
        </Component>
      </CarouselItemsContext.Provider>
    </CarouselContext.Provider>
  );
}

export type CarouselItemsProps<TAs extends React.ElementType> = {
  as?: TAs;
};

export function CarouselItems<TAs extends React.ElementType = "div">({
  as: asProp,
  children,
  onScroll: onScrollProps = noop,
  ...restProps
}: CarouselItemsProps<TAs> & React.ComponentPropsWithoutRef<TAs>) {
  const Component = asProp || "div";
  const { handleScroll } = useContext(CarouselContext);
  const sliderItemsRef = useContext(CarouselItemsContext);

  const onScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    handleScroll();
    onScrollProps(event);
  };

  return (
    <Component ref={sliderItemsRef} {...restProps} onScroll={onScroll}>
      {children}
    </Component>
  );
}

export type CarouselItemProps<TAs extends React.ElementType> = {
  as?: TAs;
  index: number;
};

export function CarouselItem<TAs extends React.ElementType = "div">({
  as: asProp,
  index,
  children,
  ...restProps
}: CarouselItemProps<TAs> & React.ComponentPropsWithoutRef<TAs>) {
  const Component = asProp || "div";
  const { currentCarousel, setCurrentCarousel } = useContext(CarouselContext);
  const carouselItemsRef = useContext(CarouselItemsContext);
  const ref = useRef<HTMLElement>(null);

  /* biome-ignore lint/correctness/useExhaustiveDependencies: -
   - `carouselItemsRef` is object returned from `useRef`, it will return the same object
   - `setCurrentCarousel` is `set` function from `useState`, the function is stable identity
    */
  useEffect(() => {
    if (!carouselItemsRef?.current) {
      return;
    }

    const onObserve = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentCarousel(index);
        }
      });
    };

    const observer = new IntersectionObserver(onObserve, {
      root: carouselItemsRef.current,
      rootMargin: "0px",
      threshold: 0.8,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      return observer.disconnect();
    };
  }, []);

  return (
    <Component ref={ref} data-active={index === currentCarousel} {...restProps}>
      {children}
    </Component>
  );
}

export type CarouselCountProps<TAs extends React.ElementType> = {
  as?: TAs;
  padStart?: number;
};

export function CarouselCount<TAs extends React.ElementType = "span">({
  as: asProp,
  padStart = 1,
  ...restProps
}: CarouselCountProps<TAs> &
  Omit<React.ComponentPropsWithoutRef<TAs>, "children">) {
  const Component = asProp || "span";
  const { carouselCount, currentCarousel } = useContext(CarouselContext);

  return (
    <Component {...restProps}>
      {String(
        carouselCount === 0 ? carouselCount : currentCarousel + 1,
      ).padStart(padStart, "0")}
    </Component>
  );
}

export type CarouselMaxProps<TAs extends React.ElementType> = {
  as?: TAs;
  padStart?: number;
};

export function CarouselMax<TAs extends React.ElementType = "span">({
  as: asProp,
  padStart = 1,
  ...restProps
}: CarouselMaxProps<TAs> &
  Omit<React.ComponentPropsWithoutRef<TAs>, "children">) {
  const Component = asProp || "span";
  const { carouselCount } = useContext(CarouselContext);

  return (
    <Component {...restProps}>
      {String(carouselCount).padStart(padStart, "0")}
    </Component>
  );
}

export type CarouselPrevProps<TAs extends React.ElementType> = {
  as?: TAs;
};

export function CarouselPrev<TAs extends React.ElementType = "button">({
  as: asProp,
  onClick: onClickProps = noop,
  ...restProps
}: CarouselPrevProps<TAs> & React.ComponentPropsWithoutRef<TAs>) {
  const Component = asProp || "button";
  const { loop, scrollPosition, scrollToPrevious } =
    useContext(CarouselContext);

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    scrollToPrevious();
    onClickProps(event);
  };

  return (
    <Component
      disabled={loop ? undefined : scrollPosition === "start"}
      {...restProps}
      onClick={onClick}
    />
  );
}

export type CarouselNextProps<TAs extends React.ElementType> = {
  as?: TAs;
};

export function CarouselNext<TAs extends React.ElementType = "button">({
  as: asProp,
  onClick: onClickProps = noop,
  ...restProps
}: CarouselNextProps<TAs> & React.ComponentPropsWithoutRef<TAs>) {
  const Component = asProp || "button";
  const { loop, scrollPosition, scrollToNext } = useContext(CarouselContext);

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    scrollToNext();
    onClickProps(event);
  };

  return (
    <Component
      disabled={loop ? undefined : scrollPosition === "end"}
      {...restProps}
      onClick={onClick}
    />
  );
}
