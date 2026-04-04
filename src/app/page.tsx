import { redirect } from "next/navigation";
import Link from "next/link";

export default function RootPage() {
  return (
    <>
      <Link href="/login">Login</Link>
      <Link href="/signup">Signup</Link>
    </>
  )
}
