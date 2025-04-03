import LoginForm from "@/components/form/login-form"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative p-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-900/20 to-indigo-900/20 blur-3xl"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-red-900/20 to-teal-900/20 blur-3xl"></div>
      </div>

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      ></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">QWALLET</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

