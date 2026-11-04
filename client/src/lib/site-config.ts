export const siteConfig = {
  appName: "FinTrack",
  developer: {
    name: "Saurabh Pandey",
    role: "Full Stack Developer",
    email: "developersaurabh001@gmail.com",
    linkedin: "https://www.linkedin.com/in/saurabhpandey-/",
    github: "https://github.com/SaurabhPandey016",
  },
  demoVideoUrl: process.env.NEXT_PUBLIC_DEMO_VIDEO_URL ?? "",
  demoRequestMailto: `mailto:developersaurabh001@gmail.com?subject=${encodeURIComponent("FinTrack live demo request")}&body=${encodeURIComponent("Hello Saurabh,\n\nI would like to request a live demo of FinTrack.\n\nThank you!")}`,
};
