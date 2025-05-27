import '@/app/globals.css';
import Nav from "@/components/Nav"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='bg-slate-800 min-h-screen min-w-screen overflow-x-hidden overscroll-x-none'>
        <main className='max-w-[1512px] min-h-screen justify-self-center bg-slate-700'>
          <Nav/>
          {children}
        </main>
      </body>
    </html>
  )
}
