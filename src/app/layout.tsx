import '@/styles/globals.css';
import Nav from "@/components/Nav"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='bg-slate-800 min-h-screen min-w-screen overflow-x-hidden overscroll-x-none'>
        <main className='max-w-[1512px] mx-auto min-h-screen bg-slate-900'>
          {children}
        </main>
      </body>
    </html>
  )
}
