"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/components/theme-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  BiLoaderAlt,
  BiErrorCircle,
  BiSun,
  BiMoon,
  BiShow,
  BiHide,
} from "react-icons/bi"

const loginSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .min(1, "Email wajib diisi"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .min(1, "Password wajib diisi"),
  remember: z.boolean().optional(),
})

type LoginValues = z.infer<typeof loginSchema>

const emptySubscribe = () => () => {}

export default function LoginPage() {
  const { login } = useAuth()
  const { theme, setTheme } = useTheme()
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  const onSubmit = async (data: LoginValues) => {
    setLoading(true)
    setError(null)
    try {
      await login(data.email, data.password, data.remember)
    } catch (err: unknown) {
      console.error(err)
      let message =
        "Gagal masuk. Silakan periksa kembali email dan password Anda."
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response
        if (response?.data?.message) {
          message = response.data.message
        }
      } else if (err instanceof Error) {
        message = err.message
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full bg-background font-sans text-foreground max-[900px]:flex-col">
      {/* THEME TOGGLE BUTTON */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border/80 bg-card/80 text-muted-foreground shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
          aria-label="Ganti tema"
          title={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
        >
          {isMounted ? (
            isDark ? (
              <BiSun className="size-4.5 text-amber-400" />
            ) : (
              <BiMoon className="size-4.5" />
            )
          ) : (
            <div className="size-4.5" />
          )}
        </button>
      </div>

      {/* LEFT: PIXEL ART ILLUSTRATION PANEL */}
      <div className="relative flex-[1.15] overflow-hidden border-b border-border/40 bg-muted max-[900px]:order-first max-[900px]:min-h-[340px] min-[901px]:border-r min-[901px]:border-b-0">
        <Image
          src="/LoginImage.webp"
          alt="Sabiru Warehouse Pixel Art Illustration"
          fill
          className="object-cover transition-opacity duration-300 dark:brightness-[0.92] dark:contrast-[1.05]"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent max-[900px]:block min-[901px]:hidden" />
      </div>

      {/* RIGHT: LOGIN FORM */}
      <div className="mx-auto flex max-w-[560px] flex-1 flex-col justify-center bg-card px-16 py-12 max-[900px]:max-w-full max-[900px]:px-6 max-[900px]:py-10">
        <div className="mx-auto w-full max-w-[440px]">
          <h1 className="mb-3 text-[32px] leading-[1.25] font-bold tracking-[-0.01em] text-foreground">
            Welcome To Sabiru Warehouse
          </h1>
          <p className="mb-7 text-[14.5px] leading-[1.5] text-muted-foreground">
            Login Dengan Akun Yang Telah Diberikan!
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-[10px] border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <BiErrorCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-[18px]">
              <Label
                className="mb-2 block text-[13.5px] font-semibold text-foreground"
                htmlFor="login-email"
              >
                Email <span className="text-[#ff7a30]">*</span>
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={cn(
                  "h-auto w-full rounded-[10px] border bg-card px-3.5 py-[13px] text-sm text-foreground transition outline-none placeholder:text-muted-foreground/60",
                  errors.email
                    ? "border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-border hover:border-border/80 focus:border-[#ff7a30] focus:shadow-[0_0_0_3px_rgba(255,122,48,0.15)]"
                )}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-[18px]">
              <Label
                className="mb-2 block text-[13.5px] font-semibold text-foreground"
                htmlFor="login-password"
              >
                Password <span className="text-[#ff7a30]">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className={cn(
                    "h-auto w-full rounded-[10px] border bg-card px-3.5 py-[13px] pr-10 text-sm text-foreground transition outline-none placeholder:text-muted-foreground/60",
                    errors.password
                      ? "border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                      : "border-border hover:border-border/80 focus:border-[#ff7a30] focus:shadow-[0_0_0_3px_rgba(255,122,48,0.15)]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Lihat password"
                  }
                >
                  {showPassword ? (
                    <BiHide className="size-4" />
                  ) : (
                    <BiShow className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mt-1 mb-[26px] flex items-center justify-between text-[13.5px]">
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground transition-colors hover:text-foreground select-none">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="size-4 shrink-0 cursor-pointer rounded border-border accent-[#ff7a30]"
                />
                Remember me
              </label>
              <Link
                className="font-medium text-muted-foreground no-underline transition-colors hover:text-foreground hover:underline"
                href="#"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              className="flex h-auto w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-foreground py-3.5 text-[15px] font-semibold text-background transition hover:bg-foreground/90 active:translate-y-px active:scale-[0.99] disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <BiLoaderAlt className="size-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}