import * as React from "react"

import { cn } from "@/lib/utils"

export interface IFooterProps extends React.HTMLAttributes<HTMLElement> { } // eslint-disable-line @typescript-eslint/no-empty-object-type

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
            기출문제의 저작권은 출제기관에게 있으며, 관련 피드백은 아래 주소로 작성해주세요.{" "}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdprHhSm4FteqbpWRfl5L67Db-_ypR2Yy_GW8ukiDG18QHHpA/viewform?pli=1"
              className="text-blue-600 hover:underline"
            >
              구글 폼 링크
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

