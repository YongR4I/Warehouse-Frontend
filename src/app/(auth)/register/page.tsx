"use client"

import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-[#111111] max-[900px]:flex-col">
      {/* LEFT: REGISTER FORM */}
      <div className="mx-auto flex max-w-[560px] flex-1 flex-col justify-center px-16 py-12 max-[900px]:max-w-full max-[900px]:px-6 max-[900px]:py-10">
        <div className="mb-12 text-xl font-bold tracking-[-0.02em]">adon</div>

        <h1 className="mb-3 text-[32px] font-bold leading-[1.25] tracking-[-0.01em]">
          Buat akun,
          <br />
          mulai sekarang!
        </h1>
        <p className="mb-7 text-[14.5px] leading-[1.5] text-[#8a8a8a]">
          Selamat datang! Lengkapi data di bawah
          <br />
          untuk membuat akun baru.
        </p>

        <div className="mb-6 flex gap-3">
          <button
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#e6e6e6] bg-white px-3.5 py-3 text-sm font-medium text-[#111111] transition hover:border-[#d8d8d8] hover:bg-[#fafafa]"
            type="button"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.52 12.27c0-.85-.08-1.66-.22-2.44H12v4.62h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.73-2.46 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.25 21.3 7.28 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.3a7.2 7.2 0 0 1 0-4.6v-3.1H1.27a12 12 0 0 0 0 10.8l4-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.25 2.7 1.27 6.6l4 3.1C6.22 6.86 8.87 4.75 12 4.75z"
              />
            </svg>
            Daftar dengan Google
          </button>
          <button
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#e6e6e6] bg-white px-3.5 py-3 text-sm font-medium text-[#111111] transition hover:border-[#d8d8d8] hover:bg-[#fafafa]"
            type="button"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#111"
                d="M16.36 1.43c0 1.14-.46 2.2-1.2 2.98-.8.85-2.1 1.5-3.2 1.42-.14-1.1.42-2.24 1.16-3 .8-.85 2.2-1.5 3.24-1.4zM20.5 17.2c-.5 1.15-.74 1.66-1.4 2.67-.9 1.4-2.18 3.14-3.75 3.15-1.4.02-1.76-.9-3.65-.9-1.9 0-2.3.88-3.7.92-1.57.05-2.77-1.5-3.67-2.9-2.02-3.1-2.24-6.75-.99-8.7.9-1.4 2.3-2.24 3.6-2.24 1.35 0 2.2.9 3.3.9 1.08 0 1.75-.92 3.3-.92 1.08 0 2.24.6 3.05 1.63-2.68 1.47-2.25 5.33.86 6.4z"
              />
            </svg>
            Daftar dengan Apple
          </button>
        </div>

        <div className="my-5 text-center text-xs text-[#c9c9c9]">ATAU</div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label
              className="mb-2 block text-[13.5px] font-semibold"
              htmlFor="register-name"
            >
              Nama Lengkap <span className="text-[#ff7a30]">*</span>
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              placeholder="Masukkan nama lengkap"
              required
              className="w-full rounded-[10px] border border-[#e6e6e6] bg-white px-3.5 py-[13px] text-sm text-[#111111] outline-none transition placeholder:text-[#b9b9b9] focus:border-[#ff7a30] focus:shadow-[0_0_0_3px_rgba(255,122,48,0.12)]"
            />
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-[13.5px] font-semibold"
              htmlFor="register-email"
            >
              Email <span className="text-[#ff7a30]">*</span>
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="Masukkan email"
              required
              className="w-full rounded-[10px] border border-[#e6e6e6] bg-white px-3.5 py-[13px] text-sm text-[#111111] outline-none transition placeholder:text-[#b9b9b9] focus:border-[#ff7a30] focus:shadow-[0_0_0_3px_rgba(255,122,48,0.12)]"
            />
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-[13.5px] font-semibold"
              htmlFor="register-password"
            >
              Password <span className="text-[#ff7a30]">*</span>
            </label>
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Buat password"
              minLength={8}
              required
              className="w-full rounded-[10px] border border-[#e6e6e6] bg-white px-3.5 py-[13px] text-sm text-[#111111] outline-none transition placeholder:text-[#b9b9b9] focus:border-[#ff7a30] focus:shadow-[0_0_0_3px_rgba(255,122,48,0.12)]"
            />
            <small className="mt-1.5 block text-xs text-[#8a8a8a]">
              Minimal 8 karakter
            </small>
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-[13.5px] font-semibold"
              htmlFor="register-confirm-password"
            >
              Konfirmasi Password <span className="text-[#ff7a30]">*</span>
            </label>
            <input
              id="register-confirm-password"
              type="password"
              name="confirm_password"
              placeholder="Ulangi password"
              minLength={8}
              required
              className="w-full rounded-[10px] border border-[#e6e6e6] bg-white px-3.5 py-[13px] text-sm text-[#111111] outline-none transition placeholder:text-[#b9b9b9] focus:border-[#ff7a30] focus:shadow-[0_0_0_3px_rgba(255,122,48,0.12)]"
            />
          </div>

          <div className="mb-[22px] mt-1 flex items-start justify-between text-[13.5px]">
            <label className="flex cursor-pointer items-start gap-2 leading-[1.4] text-[#111111]">
              <input
                type="checkbox"
                name="terms"
                required
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#ff7a30]"
              />
              Saya menyetujui{" "}
              <a
                className="font-semibold text-[#ff7a30] no-underline hover:underline"
                href="#"
              >
                Syarat &amp; Ketentuan
              </a>
            </label>
          </div>

          <button
            className="w-full cursor-pointer rounded-[10px] bg-[#111111] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#252525] active:translate-y-px"
            type="submit"
          >
            Daftar
          </button>
        </form>

        <p className="mt-[22px] text-center text-[13.5px] text-[#8a8a8a]">
          Sudah punya akun?{" "}
          <Link
            className="font-semibold text-[#111111] no-underline hover:underline"
            href="/login"
          >
            Masuk
          </Link>
        </p>
      </div>

      {/* RIGHT: PROMO PANEL */}
      <div className="relative flex flex-[1.15] items-center justify-center overflow-hidden bg-[radial-gradient(120%_100%_at_15%_0%,#ffb066_0%,transparent_55%),radial-gradient(120%_100%_at_85%_100%,#ff8a3d_0%,transparent_55%),linear-gradient(160deg,#ffcfa0_0%,#ff9a4d_55%,#ff7a30_100%)] px-10 py-14 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,255,255,0.25),transparent_60%)] before:content-[''] max-[900px]:order-first max-[900px]:min-h-[340px] max-[900px]:px-6 max-[900px]:py-10">
        <div className="relative flex w-full max-w-[440px] flex-col gap-6">
          <div className="rounded-[24px] border border-white/35 bg-white/[0.16] px-6 py-5 backdrop-blur-[6px]">
            <p className="mb-4 text-base font-semibold leading-[1.5] text-white">
              &quot;...missing key to our success.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="size-full object-cover"
                  src="https://i.pravatar.cc/68?img=47"
                  alt="Sarah Johnson"
                />
              </div>
              <div>
                <div className="text-sm font-semibold leading-[1.3] text-white">
                  Sarah Johnson
                </div>
                <div className="text-[13px] text-white/80">
                  CEO at Agile Solutions
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-[0_24px_48px_-16px_rgba(120,50,0,0.3)]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#f5f5f5]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 20V10M12 20V4M20 20v-7"
                    stroke="#111"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[#e6e6e6] px-3.5 py-1.5 text-[13px] text-[#6b6b6b]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="#6b6b6b"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 2v4M8 2v4M3 10h18"
                    stroke="#6b6b6b"
                    strokeWidth="2"
                  />
                </svg>
                Last month
              </div>
            </div>

            <div className="mb-6 flex items-end gap-2.5">
              <span className="text-4xl font-extrabold tracking-[-0.02em]">
                +84.32%
              </span>
              <span className="flex items-center rounded-full bg-[#e9f9ee] px-2.5 py-1 text-sm font-bold text-[#1fa855]">
                ↗
              </span>
            </div>

            <div className="relative flex h-[150px] items-end gap-4 pl-[30px]">
              <div className="absolute bottom-0 left-0 top-0 flex flex-col justify-between text-[11px] text-[#c2c2c2]">
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>
              <div className="flex h-full flex-1 items-end">
                <div className="h-[28%] w-full rounded-t-[6px] bg-[#ffd9b8]"></div>
              </div>
              <div className="flex h-full flex-1 items-end">
                <div className="h-[48%] w-full rounded-t-[6px] bg-[#ffb87a]"></div>
              </div>
              <div className="flex h-full flex-1 items-end">
                <div className="h-[65%] w-full rounded-t-[6px] bg-[#ff9a4d]"></div>
              </div>
              <div className="flex h-full flex-1 items-end">
                <div className="h-[92%] w-full rounded-t-[6px] bg-[#ff7a30]"></div>
              </div>
            </div>
          </div>

          <div className="flex h-14 items-center justify-between px-5 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
              <path
                d="M12 7v5l3 3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3.5 py-1.5 text-[13px] text-white">
              Last month
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}