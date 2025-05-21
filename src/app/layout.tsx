import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='min-w-screen min-h-screen bg-slate-700'>
        {children}
      </body>
    </html>
  )
}
