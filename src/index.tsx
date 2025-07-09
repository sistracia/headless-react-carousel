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

type ScrollPosition = "start" | "middle" | "end";

type SliderContextObject = {
  slideCount: number;
  currentSlide: number;
  loop: boolean;
  setCurrentSlide: (slide: number) => void;
  prev: () => void;
  next: () => void;
  handleScroll: () => void;
  scrollToNext: () => void;
  scrollToPrevious: () => void;
  scrollPosition: ScrollPosition;
};

/**
 * Ref - https://iykethe1st.hashnode.dev/a-react-ref-adventure-creating-a-smooth-scrolling-carousel-using-react-and-tailwind-css
 */
export function useSlider(slideCount: number, loop: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>("start");

  const prev = useCallback<SliderContextObject["prev"]>(() => {
    setCurrentSlide((currentSlide) => {
      const isFirstSlide = currentSlide === 0;
      if (isFirstSlide && loop) {
        return slideCount - 1;
      }

      if (isFirstSlide && !loop) {
        return currentSlide;
      }

      return --currentSlide;
    });
  }, [slideCount, loop]);

  const next = useCallback<SliderContextObject["next"]>(() => {
    setCurrentSlide((currentSlide) => {
      const isLastSlide = currentSlide === slideCount - 1;
      if (isLastSlide && loop) {
        return 0;
      }

      if (isLastSlide && !loop) {
        return currentSlide;
      }

      return ++currentSlide;
    });
  }, [slideCount, loop]);

  const handleScroll = useCallback<SliderContextObject["handleScroll"]>(() => {
    const container = containerRef.current;
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
    SliderContextObject["scrollToPrevious"]
  >(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const isFirstSlide = currentSlide === 0;
    let nextScrollLeft = container.scrollLeft - container.offsetWidth;
    if (isFirstSlide && loop) {
      nextScrollLeft = container.offsetWidth * slideCount - 1;
    }

    container.scrollTo({
      left: nextScrollLeft,
      behavior: "smooth",
    });
  }, [currentSlide, slideCount, loop]);

  const scrollToNext = useCallback<SliderContextObject["scrollToNext"]>(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const isLastSlide = currentSlide === slideCount - 1;
    let nextScrollLeft = container.scrollLeft + container.offsetWidth;
    if (isLastSlide && loop) {
      nextScrollLeft = 0;
    }

    container.scrollTo({
      left: nextScrollLeft,
      behavior: "smooth",
    });
  }, [currentSlide, slideCount, loop]);

  return {
    containerRef,
    currentSlide,
    setCurrentSlide,
    prev,
    next,
    scrollToPrevious,
    scrollToNext,
    scrollPosition,
    setScrollPosition,
    handleScroll,
  };
}

const SliderContext = createContext<SliderContextObject>({
  slideCount: 0,
  currentSlide: 0,
  loop: true,
  setCurrentSlide: noop,
  prev: noop,
  next: noop,
  scrollToNext: noop,
  scrollToPrevious: noop,
  scrollPosition: "start",
  handleScroll: noop,
});

const SliderItemsContext =
  createContext<React.RefObject<HTMLElement | null> | null>(null);

type SliderProps<TAs extends React.ElementType> = {
  as?: TAs;
  header?: React.ReactNode;
  slideCount?: number;
  loop?: boolean;
};

export function Slider<TAs extends React.ElementType = "div">({
  as: asProp,
  children,
  id,
  slideCount = 0,
  loop = true,
  ...restProps
}: SliderProps<TAs> & React.ComponentPropsWithoutRef<TAs>) {
  const Component = asProp || "div";
  const {
    currentSlide,
    next,
    prev,
    setCurrentSlide,
    containerRef,
    scrollToNext,
    scrollToPrevious,
    handleScroll,
    scrollPosition,
  } = useSlider(slideCount, loop);

  return (
    <SliderContext.Provider
      value={{
        slideCount,
        currentSlide,
        loop,
        setCurrentSlide,
        next,
        prev,
        scrollToNext,
        scrollToPrevious,
        handleScroll,
        scrollPosition,
      }}
    >
      <SliderItemsContext.Provider value={containerRef}>
        <Component id={id} {...restProps}>
          {children}
        </Component>
      </SliderItemsContext.Provider>
    </SliderContext.Provider>
  );
}

type SliderItemsProps<TAs extends React.ElementType> = {
  as?: TAs;
};

export function SliderItems<TAs extends React.ElementType = "div">({
  as: asProp,
  children,
  onScroll: onScrollProps = noop,
  ...restProps
}: SliderItemsProps<TAs> & React.ComponentPropsWithoutRef<TAs>) {
  const Component = asProp || "div";
  const { handleScroll } = useContext(SliderContext);
  const ref = useContext(SliderItemsContext);

  const onScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    handleScroll();
    onScrollProps(event);
  };

  return (
    <Component ref={ref} {...restProps} onScroll={onScroll}>
      {children}
    </Component>
  );
}

type SliderItemProps<TAs extends React.ElementType> = {
  as?: TAs;
  index: number;
};

export function SliderItem<TAs extends React.ElementType = "div">({
  as: asProp,
  index,
  children,
  ...restProps
}: SliderItemProps<TAs> & React.ComponentPropsWithoutRef<TAs>) {
  const Component = asProp || "div";
  const { currentSlide, setCurrentSlide } = useContext(SliderContext);
  const sliderItemsRef = useContext(SliderItemsContext);
  const ref = useRef<HTMLElement>(null);

  /* biome-ignore lint/correctness/useExhaustiveDependencies: -
   - `sliderItemsRef` is object returned from `useRef`, it will return the same object
   - `setCurrentSlide` is `set` function from `useState`, the function is stable identity
    */
  useEffect(() => {
    if (!sliderItemsRef?.current) {
      return;
    }

    const onObserve = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentSlide(index);
        }
      });
    };

    const observer = new IntersectionObserver(onObserve, {
      root: sliderItemsRef.current,
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
    <Component ref={ref} data-active={index === currentSlide} {...restProps}>
      {children}
    </Component>
  );
}

type SliderCountProps<TAs extends React.ElementType> = {
  as?: TAs;
  padStart?: number;
};

export function SliderCount<TAs extends React.ElementType = "span">({
  as: asProp,
  padStart = 1,
  ...restProps
}: SliderCountProps<TAs> &
  Omit<React.ComponentPropsWithoutRef<TAs>, "children">) {
  const Component = asProp || "span";
  const { slideCount, currentSlide } = useContext(SliderContext);

  return (
    <Component {...restProps}>
      {String(slideCount === 0 ? slideCount : currentSlide + 1).padStart(
        padStart,
        "0",
      )}
    </Component>
  );
}

type SliderMaxProps<TAs extends React.ElementType> = {
  as?: TAs;
  padStart?: number;
  prefix?: React.ReactNode;
};

export function SliderMax<TAs extends React.ElementType = "span">({
  as: asProp,
  padStart = 1,
  prefix,
  ...restProps
}: SliderMaxProps<TAs> &
  Omit<React.ComponentPropsWithoutRef<TAs>, "children">) {
  const Component = asProp || "span";
  const { slideCount } = useContext(SliderContext);

  return (
    <Component {...restProps}>
      {prefix}
      {String(slideCount).padStart(padStart, "0")}
    </Component>
  );
}

type SliderPrevProps<TAs extends React.ElementType> = {
  as?: TAs;
};

export function SliderPrev<TAs extends React.ElementType = "button">({
  as: asProp,
  onClick: onClickProps = noop,
  ...restProps
}: SliderPrevProps<TAs> & React.ComponentPropsWithoutRef<TAs>) {
  const Component = asProp || "button";
  const { prev, loop, scrollPosition, scrollToPrevious } =
    useContext(SliderContext);

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    prev();
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

type SliderNextProps<TAs extends React.ElementType> = {
  as?: TAs;
};

export function SliderNext<TAs extends React.ElementType = "button">({
  as: asProp,
  onClick: onClickProps = noop,
  ...restProps
}: SliderNextProps<TAs> & React.ComponentPropsWithoutRef<TAs>) {
  const Component = asProp || "button";
  const { next, loop, scrollPosition, scrollToNext } =
    useContext(SliderContext);

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    next();
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
