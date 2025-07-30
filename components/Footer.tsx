import React from 'react';
import Link from "next/link";

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const IconBrandInstagram: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <circle cx="12" cy="12" r="3" />
    <line x1="16.5" y1="7.5" x2="16.5" y2="7.501" />
  </svg>
);

const IconBrandYoutube: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <rect x="3" y="5" width="18" height="14" rx="4" />
    <path d="M10 9l5 3l-5 3z" />
  </svg>
);

const IconBrandDiscord: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <path d="M7.5 7.5c3.5-1 5.5-1 9 0" />
    <path d="M7 16.5c3.5 1 6.5 1 10 0" />
    <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833 -1.667 3.5 -3 .667 -1.667 .5 -5.833 -1.5 -11.5 -1.457 -1.015 -3 -1.34 -4.5 -1.5l-1 2.5" />
    <path d="M8.5 17c0 1 -1.5 3 -2 3 -1.5 0 -2.833 -1.667 -3.5 -3 -.667 -1.667 -.5 -5.833 1.5 -11.5 1.457 -1.015 3 -1.34 4.5 -1.5l1 2.5" />
  </svg>
);

const IconBrandLinkedin: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <line x1="8" y1="11" x2="8" y2="16" />
    <line x1="8" y1="8" x2="8" y2="8.01" />
    <line x1="12" y1="16" x2="12" y2="11" />
    <path d="M16 16v-3a2 2 0 0 0 -4 0" />
  </svg>
);

const IconMail: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 7 12 13 21 7" />
  </svg>
);

const IconBrandWhatsapp: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
    <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
  </svg>
);

export default function Footer() {
  const socialLinks = [
    {
      icon: <IconBrandInstagram />,
      name: "Instagram",
      href: "https://www.instagram.com/drawv.esports?igsh=a3hkNnJqdHFvbmwy&utm_source=qr"
    },
    {
      icon: <IconBrandYoutube />,
      name: "YouTube",
      href: "https://youtube.com/@drawvesports?si=BSN69gbXTvvRAImd"
    },
    {
      icon: <IconBrandDiscord />,
      name: "Discord",
      href: "https://discord.gg/nqr6XATFa5"
    },
    {
      icon: <IconBrandLinkedin />,
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/draw-v-323a27351?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
    },
    {
      icon: <IconMail />,
      name: "Email",
      href: "mailto:draw5.esports@gmail.com"  // Changed to mailto: for email link
    },
    {
      icon: <IconBrandWhatsapp />,
      name: "WhatsApp",
      href: "https://chat.whatsapp.com/F2qNzLZpdHUEWqcev1Suwh?mode=ac_t"
    }
  ];

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-400">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
          {/* Left side: Logo and Copyright */}
          <div className="text-center sm:text-left">
            <Link href="/" className="inline-block mb-4">
              <img
                src="logo-dark.png"
                alt="Draw V Logo"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Draw V. All Rights Reserved.
            </p>
          </div>

          {/* Right side: Social Links */}
          <div className="flex flex-wrap justify-center items-center gap-5">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                aria-label={link.name}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-sky-400 transition-colors duration-300"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
