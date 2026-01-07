import { Toaster } from 'react-hot-toast'

export function Toast() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: 'bg-neutral-900 border border-neutral-800 text-white',
        duration: 2000,
        success: {
          duration: 2000,
          iconTheme: {
            primary: 'green',
            secondary: 'white',
          },
        },
        error: {
          duration: 2000,
          iconTheme: {
            primary: 'red',
            secondary: 'white',
          },
        },
      }}
    />
  )
}
