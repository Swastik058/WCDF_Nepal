function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-100">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700" />
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
            </div>
            <span className="text-xl font-bold">Mayaghar</span>
          </div>
          <p className="text-sm text-slate-300">Women and Child Development Forum Nepal.</p>
          <p className="text-xs text-slate-500">Copyright 2025 WCDF-Nepal. All rights reserved.</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#home" className="text-slate-300 transition hover:text-white">Home</a>
            <a href="#about" className="text-slate-300 transition hover:text-white">About Us</a>
            <a href="#gallery" className="text-slate-300 transition hover:text-white">Gallery</a>
            <a href="#contact" className="text-slate-300 transition hover:text-white">Contact</a>
            <a href="#programs" className="text-slate-300 transition hover:text-white">Programs</a>
            <a href="#events" className="text-slate-300 transition hover:text-white">Events/Campaign</a>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold">Get in Touch</h3>
            <p className="text-sm text-slate-300">wcdf-mayaghar@gmail.com</p>
            <div className="flex gap-2">
              <div className="h-9 w-9 rounded bg-slate-800" />
              <div className="h-9 w-9 rounded bg-slate-800" />
              <div className="h-9 w-9 rounded bg-slate-800" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <a href="#terms" className="transition hover:text-white">Terms and Condition</a>
            <a href="#privacy" className="transition hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer