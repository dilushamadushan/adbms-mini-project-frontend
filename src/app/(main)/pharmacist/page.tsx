import { redirect } from 'next/navigation';

export default function PharmacistRootRedirect() {
  redirect('/pharmacist/dashboard');
}
