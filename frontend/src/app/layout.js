import './globals.css';
import { UserProvider } from './UserContext'; // <-- Import new provider

export const metadata = {
  title: 'Stash',
  description: 'The Zero-Effort Universal Save',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    // <ClerkProvider> is removed
    <UserProvider> 
      <html lang="en">
        <body>{children}</body>
      </html>
    </UserProvider>
  );
}