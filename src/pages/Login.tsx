import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import iseLogo3 from "@/assets/ISE Logo3.svg";
import iseLogo4 from "@/assets/ISE Logo4.svg";

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("d.academico@ise.edu.br");
  const [password, setPassword] = useState("ise2024");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ssoLoading, setSsoLoading] = useState(false);

  const handleSSOLogin = async () => {
    setSsoLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    navigate("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    if (email && password) {
      navigate("/dashboard");
    } else {
      setError("Credenciais inválidas.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding only */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-light rounded-full opacity-30" />
          <div className="absolute bottom-10 -left-20 w-64 h-64 bg-primary-dark rounded-full opacity-40" />
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary-light rounded-full opacity-20" />
        </div>

        {/* Logo top */}
        <div className="relative z-10">
          <img src={iseLogo3} alt="ISE Business School" className="h-10 w-auto" />
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-primary-foreground font-display font-bold text-4xl leading-tight">
              Planejamento<br />acadêmico<br />inteligente
            </h2>
            <p className="text-primary-foreground/80 mt-4 text-base leading-relaxed max-w-sm">
              A fonte única da verdade para toda operação acadêmica do ISE Business School.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-primary-foreground/50 text-xs">© 2024 ISE Business School · Plataforma Oficial</p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center mb-8 lg:hidden">
            <img src={iseLogo4} alt="ISE" className="h-8 w-auto" />
          </div>

          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl text-foreground">Bem-vindo de volta</h1>
            <p className="text-muted-foreground text-sm mt-1">Acesse com sua conta institucional</p>
          </div>

          {/* Microsoft SSO */}
          <button
            type="button"
            onClick={handleSSOLogin}
            disabled={ssoLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-border rounded-md bg-card hover:bg-muted font-semibold text-sm text-foreground transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {ssoLoading ? (
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <MicrosoftIcon />
            )}
            {ssoLoading ? "Redirecionando..." : "Entrar com conta Microsoft"}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou acesse com e-mail</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">E-mail institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-input rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="nome@ise.edu.br"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-input rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm text-muted-foreground">Manter conectado</span>
              </label>
              <button type="button" className="text-sm text-primary hover:text-primary-light font-medium transition-colors">
                Esqueci minha senha
              </button>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 bg-primary/5 border border-primary/15 rounded-md">
            <p className="text-xs text-muted-foreground font-medium mb-1">🔑 Acesso de demonstração</p>
            <p className="text-xs text-muted-foreground">E-mail: <span className="text-foreground font-mono">d.academico@ise.edu.br</span></p>
            <p className="text-xs text-muted-foreground">Senha: <span className="text-foreground font-mono">ise2024</span></p>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Problemas de acesso? Contate o{" "}
            <button className="text-primary hover:underline">suporte TI</button>
          </p>
        </div>
      </div>
    </div>
  );
}
