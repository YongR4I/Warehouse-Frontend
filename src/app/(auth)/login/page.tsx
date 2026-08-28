"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { BiLoaderAlt, BiErrorCircle } from "react-icons/bi"

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

export default function LoginPage() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className="flex min-h-screen w-full bg-card font-sans text-[#111111] max-[900px]:flex-col">
      {/* LEFT: PIXEL ART ILLUSTRATION PANEL */}
      <div className="relative flex-[1.15] overflow-hidden bg-muted max-[900px]:order-first max-[900px]:min-h-[340px]">
        <Image
          src="/LoginImage.webp"
          alt="Sabiru Warehouse Pixel Art Illustration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* RIGHT: LOGIN FORM */}
      <div className="mx-auto flex max-w-[560px] flex-1 flex-col justify-center bg-card px-16 py-12 max-[900px]:max-w-full max-[900px]:px-6 max-[900px]:py-10">
        <div className="mx-auto w-full max-w-[440px]">
          <h1 className="mb-3 text-[32px] leading-[1.25] font-bold tracking-[-0.01em]">
            Welcome To Sabiru Warehouse
          </h1>
          <p className="mb-7 text-[14.5px] leading-[1.5] text-[#8a8a8a]">
            Login Dengan Akun Yang Telah Diberikan!
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-[10px] border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-500">
              <BiErrorCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-[18px]">
              <Label
                className="mb-2 block text-[13.5px] font-semibold text-[#111111]"
                htmlFor="login-email"
              >
                Email <span className="text-[#ff7a30]">*</span>
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={`h-auto w-full rounded-[10px] border bg-card px-3.5 py-[13px] text-sm text-[#111111] transition outline-none placeholder:text-[#b9b9b9] ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                    : "border-[#e6e6e6] focus:border-[#ff7a30] focus:shadow-[0_0_0_3px_rgba(255,122,48,0.12)]"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-[18px]">
              <Label
                className="mb-2 block text-[13.5px] font-semibold text-[#111111]"
                htmlFor="login-password"
              >
                Password <span className="text-[#ff7a30]">*</span>
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className={`h-auto w-full rounded-[10px] border bg-card px-3.5 py-[13px] text-sm text-[#111111] transition outline-none placeholder:text-[#b9b9b9] ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                    : "border-[#e6e6e6] focus:border-[#ff7a30] focus:shadow-[0_0_0_3px_rgba(255,122,48,0.12)]"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mt-1 mb-[26px] flex items-center justify-between text-[13.5px]">
              <label className="flex cursor-pointer items-center gap-2 text-[#111111] select-none">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="size-4 shrink-0 cursor-pointer rounded accent-[#ff7a30]"
                />
                Remember me
              </label>
              <Link
                className="font-medium text-[#111111] no-underline hover:underline"
                href="#"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              className="flex h-auto w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#111111] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#252525] active:translate-y-px"
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