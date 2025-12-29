import { LucideProps } from 'lucide-react'

export function HomeIcon({ ...props }: LucideProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="white"
    >
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
    </svg>
  )
}

export function WritingIcon({ ...props }: LucideProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="white"
    >
      <path
        fillRule="evenodd"
        d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
        clipRule="evenodd"
      ></path>
      <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"></path>
    </svg>
  )
}

export function ProjectIcon({ ...props }: LucideProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export function GithubIcon({ ...props }: LucideProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 17 16"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.06478 0C3.61133 0 0 3.6722 0 8.20248C0 11.8266 2.31081 14.9013 5.51518 15.9859C5.91823 16.0618 6.06622 15.808 6.06622 15.5913C6.06622 15.3957 6.05875 14.7496 6.05528 14.0642C3.81164 14.5604 3.3382 13.0963 3.3382 13.0963C2.97134 12.1483 2.44275 11.8961 2.44275 11.8961C1.71103 11.387 2.49791 11.3975 2.49791 11.3975C3.30775 11.4552 3.73417 12.2428 3.73417 12.2428C4.45347 13.4968 5.62083 13.1343 6.08103 12.9247C6.15342 12.3947 6.36245 12.0325 6.59305 11.8278C4.80178 11.6204 2.91872 10.9171 2.91872 7.77405C2.91872 6.87851 3.23377 6.14679 3.74966 5.57235C3.66593 5.36561 3.38987 4.53148 3.8278 3.40163C3.8278 3.40163 4.50501 3.18118 6.04619 4.24243C6.68951 4.0607 7.37942 3.96953 8.06478 3.96644C8.75018 3.96953 9.44062 4.0607 10.0851 4.24243C11.6244 3.18118 12.3007 3.40163 12.3007 3.40163C12.7397 4.53148 12.4635 5.36561 12.3798 5.57235C12.8969 6.14679 13.2098 6.87851 13.2098 7.77405C13.2098 10.9245 11.3231 11.6182 9.52728 11.8213C9.81657 12.0758 10.0743 12.575 10.0743 13.3403C10.0743 14.4377 10.065 15.321 10.065 15.5913C10.065 15.8096 10.2101 16.0653 10.6189 15.9848C13.8216 14.899 16.1294 11.8254 16.1294 8.20248C16.1294 3.6722 12.5187 0 8.06478 0Z"
      ></path>
    </svg>
  )
}

export function LoadingIcon({ ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      {...props}
      fill="white"
    >
      <style>
        {
          '@keyframes spinner_fUkk{25%,8.33%{x:13px;y:1px}33.3%,50%{x:13px;y:13px}58.33%,75%{x:1px;y:13px}83.33%{x:1px;y:1px}}.spinner_9y7u{animation:spinner_fUkk 2.4s linear infinite;animation-delay:-2.4s}'
        }
      </style>
      <rect
        width={10}
        height={10}
        x={1}
        y={1}
        className="spinner_9y7u"
        rx={1}
      />
      <rect
        width={10}
        height={10}
        x={1}
        y={1}
        className="spinner_9y7u"
        rx={1}
        style={{
          animationDelay: '-1.6s',
        }}
      />
      <rect
        width={10}
        height={10}
        x={1}
        y={1}
        className="spinner_9y7u"
        rx={1}
        style={{
          animationDelay: '-.8s',
        }}
      />
    </svg>
  )
}

export function BookMarkIcon({ ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="currentColor"
      viewBox="0 0 20 20"
      {...props}
    >
      <path d="M5 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 18V4z" />
    </svg>
  )
}

export function UrlIcon({ ...props }: LucideProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  )
}

export function MediumIcon({ ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="white"
      viewBox="0 0 30 30"
      {...props}
    >
      <path
        fill="white"
        d="M8.5 7a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17zM22 8a4 7.5 0 1 0 0 15 4 7.5 0 1 0 0-15zm6.5 1a1.5 6.5 0 1 0 0 13 1.5 6.5 0 1 0 0-13z"
      />
    </svg>
  )
}

export function DevToIcon({ ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 48 48"
      {...props}
    >
      <path
        fill="white"
        d="M42 37a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v26z"
      />
      <path d="M14.986 30.467H10.88V17.342h4.105a3.4 3.4 0 0 1 3.4 3.4v6.325a3.398 3.398 0 0 1-3.399 3.4zm-.103-2.445a1.2 1.2 0 0 0 1.2-1.2v-5.833a1.2 1.2 0 0 0-1.2-1.2H13.38v8.233h1.503zM26.391 19.617v-2.3h-5.046a1.5 1.5 0 0 0-1.5 1.5v10.134a1.5 1.5 0 0 0 1.5 1.5h5.046v-2.3h-4.247V25.03h2.615v-2.3h-2.615v-3.113h4.247zM37.73 17.32l-2.94 11.67c-.51 2.02-3.37 2.02-3.88 0l-2.95-11.67h2.58l2.31 9.14 2.3-9.14h2.58z" />
    </svg>
  )
}
