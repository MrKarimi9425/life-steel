import classNames from 'classnames'
import {
    BsFillCaretDownFill,
    BsFillCaretLeftFill,
    BsFillCaretRightFill,
    BsFillCaretUpFill,
} from 'react-icons/bs'

export type ArrowPlacement =
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end'

interface ArrowProps {
    placement: ArrowPlacement
    color: string
}

const Arrow = ({ placement, color }: ArrowProps) => {
    const arrowDefaultClass = `absolute ${color}`
    const arrows = {
        top: (
            <BsFillCaretDownFill
                className={`${arrowDefaultClass} -bottom-2 left-0 w-full`}
            />
        ),
        'top-start': (
            <BsFillCaretDownFill
                className={`${arrowDefaultClass} -bottom-2 left-0 ml-3`}
            />
        ),
        'top-end': (
            <BsFillCaretDownFill
                className={`${arrowDefaultClass} -bottom-2 right-0 mr-3`}
            />
        ),
        right: (
            <BsFillCaretLeftFill
                className={`${arrowDefaultClass} top-1/2 -left-2 -translate-y-1/2 transform`}
            />
        ),
        'right-start': (
            <BsFillCaretLeftFill
                className={`${arrowDefaultClass} top-2 -left-2`}
            />
        ),
        'right-end': (
            <BsFillCaretLeftFill
                className={`${arrowDefaultClass} -left-2 bottom-2`}
            />
        ),
        bottom: (
            <BsFillCaretUpFill
                className={`${arrowDefaultClass} -top-2 left-0 w-full`}
            />
        ),
        'bottom-start': (
            <BsFillCaretUpFill
                className={`${arrowDefaultClass} -top-2 left-0 ml-3`}
            />
        ),
        'bottom-end': (
            <BsFillCaretUpFill
                className={`${arrowDefaultClass} -top-2 right-0 mr-3`}
            />
        ),
        left: (
            <BsFillCaretRightFill
                className={`${arrowDefaultClass} top-1/2 -right-2 -translate-y-1/2 transform`}
            />
        ),
        'left-start': (
            <BsFillCaretRightFill
                className={`${arrowDefaultClass} top-2 -right-2`}
            />
        ),
        'left-end': (
            <BsFillCaretRightFill
                className={`${arrowDefaultClass} right-2 bottom-2`}
            />
        ),
    }

    return <div className={classNames()}>{arrows[placement]}</div>
}

export default Arrow
