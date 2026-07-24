export default function PlanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className='w-full min-h-fit bg-[#FDFDFD]'>{children}</div>;
}
