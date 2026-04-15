import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 lg:gap-32">
          {/* Brand */}
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex items-center">
              <Image
                src="/alpha_tech_logo.png"
                alt={SITE_NAME}
                width={180}
                height={60}
                className="h-auto w-auto max-w-[160px] sm:max-w-[180px]"
              />
            </Link>
          </div>

          {/* Links + Social */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:justify-end">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <a
              href="https://www.facebook.com/share/1T9BdeFtSS/?mibextid=wwXIfr"
              aria-label="Facebook"
              className="text-gray-400 hover:text-brand-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
