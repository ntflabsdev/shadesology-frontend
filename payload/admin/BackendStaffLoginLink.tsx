import Link from "next/link";

export function BackendStaffLoginLink() {
  return (
    <p>
      Staff accounts sign in through{" "}
      <Link href="/login?redirect=%2Fadmin%2Forders">Shadesology staff login</Link>.
    </p>
  );
}
