import { CommonProps } from '@/@types/common'
import LayoutBase from '../../components/LayoutBase'
import SidePanel from '../../components/SidePanel'
import { LAYOUT_BLANK } from '@/constants/theme.constant'

const Blank = ({ children }: CommonProps) => {
    return (
        <LayoutBase
            type={LAYOUT_BLANK}
            className="app-layout-blank flex flex-auto flex-col h-[100vh]"
        >
            <div className="flex min-w-0 w-full flex-1">
                {children}
                <SidePanel className="fixed top-96 cursor-pointer select-none rounded-none bg-primary p-3 text-xl text-neutral hover:!bg-primary hover:text-neutral ltr:right-0 ltr:rounded-tl-lg ltr:rounded-bl-lg rtl:left-0 rtl:rounded-tr-lg rtl:rounded-br-lg" />
            </div>
        </LayoutBase>
    )
}

export default Blank
