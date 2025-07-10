# Headles React Carousel

## Install

```bash
pnpm add @sist/react-carousel
# or
npm install @sist/react-carousel
# or
yarn add @sist/react-carousel
# or other package manager equivalent
```

## API

### Context

#### `CarouselContext`

`React.Context<CarouselContextObject>`

### Hooks

#### `useCarousel`

Parameters:

- `carouselCount: number`, the number of `CarouselItem` will be used.
- `loop?: boolean = true`, move back to the first `CarouselItem` when the `CarouselNext` is clicked at the last `CarouselItem`, or move the last `CarouselItem` when `CarouselPrev` is clicked at the first `CarouselItem`.

Returns:

- `sliderItemsRef: React.RefObject<HTMLElement>`, the `ref` for the `CarouselItems` element.
- `currentCarousel: number`, the state of the `CarouselItem` index shown on the screen.
- `setCurrentCarousel: React.Dispatch<React.SetStateAction<number>>`, to set the `currentCarousel` state.
- `scrollToPrevious: () => void`, the function is called when the `CarouselPrev` is clicked.
- `scrollToNext: () => void`, the function is called when the `CarouselNext` is clicked.
- `scrollPosition: ScrollPosition`, the state of the `CarouselItems` scroll position, it will `start` when the first `CarouselItem` is fully shown, `end` when the last `CarouselItem` is fully shown, and `middle` for the rest.
- `handleScroll: () => void`, the function is called when the `CarouselItems` is scrolled.

### Components

#### `Carousel`

Props:

- `as?: React.ElementType = 'div'`, the element that is used to render the component, the possible value is an HTML tag, like 'a', 'p', 'div', etc.
- `carouselCount?: number`, see the `useCarousel` first parameter.
- `loop?: boolean`, see the `useCarousel` second parameter.

#### `CarouselItems`

Props:

- `as?: React.ElementType = 'div'`, the element that is used to render the component, the possible value is an HTML tag, like 'a', 'p', 'div', etc.


#### `CarouselItem`

Props:

- `as?: React.ElementType = 'div'`, the element that is used to render the component, the possible value is an HTML tag, like 'a', 'p', 'div', etc.
- `index: number`, the index order of the `CarouselItems`.

data-attribute:

- `data-active`, `true` when the `CarouselItem` is the main focus, `false` otherwise.

#### `CarouselCount`

Props:

- `as?: React.ElementType = 'span'`, the element that is used to render the component, the possible value is an HTML tag, like 'a', 'p', 'div', etc.
- `padStart?: number`, the first parameter of `String.padStart`, used to pad the counter number with zeros.

#### `CarouselMax`

Props:

- `as?: React.ElementType = 'span'`, the element that is used to render the component, the possible value is an HTML tag, like 'a', 'p', 'div', etc.
- `padStart?: number`, the first parameter of `String.padStart`, used to pad the counter number with zeros.

#### `CarouselPrev`

It will `disabled` when the `Carousel` `loop` is `false` and the first `CarouselItem` is shown.

Props:

- `as?: React.ElementType = 'button'`, the element that is used to render the component, the possible value is an HTML tag, like 'a', 'p', 'div', etc.

#### `CarouselNext`

It will `disabled` when the `Carousel` `loop` is `false` and the last `CarouselItem` is shown.

Props:

- `as?: React.ElementType = 'button'`, the element that is used to render the component, the possible value is an HTML tag, like 'a', 'p', 'div', etc.

### Types

#### `ScrollPosition`

"start" | "middle" | "end"

#### `CarouselContextObject`

```ts
{
  carouselCount: number;
  currentCarousel: number;
  loop: boolean;
  setCurrentCarousel: (carousel: number) => void;
  handleScroll: () => void;
  scrollToNext: () => void;
  scrollToPrevious: () => void;
  scrollPosition: ScrollPosition;
}
```

## Example

```ts
import {
  Carousel,
  CarouselCount,
  CarouselMax,
  CarouselItems,
  CarouselItem,
  CarouselPrev,
  CarouselNext,
} from '@sist/react-carousel';

export function App() {
  return (
    <Carousel carouselCount={3} loop={true}>
      <CarouselItems style={carouselItemsStyle}>
        <CarouselItem index={0} style={carouselItemStyle}>
          <img
            src="https://picsum.photos/id/1/1000/700"
            width={1000}
            height={700}
          />
        </CarouselItem>
        <CarouselItem index={1} style={carouselItemStyle}>
          <img
            src="https://picsum.photos/id/2/1000/700"
            width={1000}
            height={700}
          />
        </CarouselItem>
        <CarouselItem index={2} style={carouselItemStyle}>
          <img
            src="https://picsum.photos/id/3/1000/700"
            width={1000}
            height={700}
          />
        </CarouselItem>
      </CarouselItems>
      <div>
        <CarouselCount /> / <CarouselMax />
        <CarouselPrev>Before</CarouselPrev>
        <CarouselNext>Next</CarouselNext>
      </div>
    </Carousel>
  );
}

const carouselItemsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'nowrap',
  overflow: 'scroll',
  width: '100%',
  scrollSnapType: 'x mandatory',
};

const carouselItemStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  scrollSnapAlign: 'start',
};
```

[StackBlitz](https://stackblitz.com/edit/vitejs-vite-1yyfzgrz)
