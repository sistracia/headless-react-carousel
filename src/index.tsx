export type CarouselProps<TAs extends React.ElementType> = {
    as?: TAs
}

export function Carousel<TAs extends React.ElementType = 'div'>({ as: asProp, ...props }: CarouselProps<TAs>) {
    const Compnent = asProp || 'div'
    return <Compnent {...props} />
}