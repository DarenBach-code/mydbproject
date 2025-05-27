import '@/app/globals.css';
import Nav from "@/components/Nav"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main className='min-h-screen min-w-screen bg-slate-700'>
          <Nav/>
          {children}
        </main>
      </body>
    </html>
  )
}
