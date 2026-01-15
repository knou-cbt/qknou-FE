import * as React from "react"

import { cn } from "@/lib/utils"

export interface IFooterProps extends React.HTMLAttributes<HTMLElement> { }

const Footer = React.forwardRef<HTMLElement, IFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          "border-t border-[#E5E7EB] bg-white mt-auto",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-6 text-center text-[#6B7280] text-xs md:text-sm space-y-1 md:space-y-2">
          <p>
          QKNOU는 지난 방통대 기출문제를 온라인에서 풀이해 볼 수 있는 무료사이트입니다.
          </p>
          <p>
            기출문제의 저작권은 출제기관에게 있으며, 관련 문의는 아래 주소로 메일바랍니다.{" "}
            <a
              href="mailto:admin@gmail.com"
              className="text-blue-600 hover:underline"
            >
              admin@gmail.com
            </a>
          </p>
          <p className="mt-4">© 2025 QKNOU. All rights reserved.</p>
        </div>
      </footer>
    )
  }
)
Footer.displayName = "Footer"

export { Footer }

