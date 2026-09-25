export enum SIZES {
    XS = 'xs',
    SM = 'sm',
    MD = 'md',
    LG = 'lg',
}

export const CONTROL_SIZES: Record<
    SIZES,
    { h: string; w: string; minH: string; minW: string }
> = {
    [SIZES.XS]: {
        h: 'h-8',
        w: 'w-8',
        minH: 'min-h-8',
        minW: 'min-w-8',
    },
    [SIZES.SM]: {
        h: 'h-10',
        w: 'w-10',
        minH: 'min-h-10',
        minW: 'min-w-10',
    },
    [SIZES.MD]: {
        h: 'h-12',
        w: 'w-12',
        minH: 'min-h-12',
        minW: 'min-w-12',
    },
    [SIZES.LG]: {
        h: 'h-14',
        w: 'w-14',
        minH: 'min-h-14',
        minW: 'min-w-14',
    },
}

export const LAYOUT = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    INLINE: 'inline',
}

export const DROPDOWN_ITEM_TYPE: Record<
    string,
    'default' | 'header' | 'divider' | 'custom'
> = {
    DEFAULT: 'default',
    HEADER: 'header',
    DIVIDER: 'divider',
    CUSTOM: 'custom',
}
