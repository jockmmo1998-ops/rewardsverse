import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldAlert, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const { user, loading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const promoteMutation = trpc.admin.promoteByPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Đã cấp quyền Admin!");
      // Reload để refresh session và role
      window.location.href = "/admin";
    },
    onError: (err) => {
      toast.error(err.message || "Mật khẩu không đúng");
    },
  });

  const handleSubmit = async () => {
    if (!secret.trim() || secret.length < 4) return;
    setIsSubmitting(true);
    try {
      await promoteMutation.mutateAsync({ secret: secret.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nếu đã là admin thì redirect thẳng
  if (!loading && isAdmin) {
    setLocation("/admin");
    return null;
  }

  // Phải đăng nhập trước
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm border-border/50 bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-7 h-7 text-red-400" />
            </div>
            <CardTitle className="text-xl">Chưa đăng nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Bạn cần đăng nhập tài khoản trước, sau đó quay lại trang này để nhập mật khẩu admin.
            </p>
            <Button
              className="w-full gradient-green-cyan text-white font-bold"
              onClick={() => setLocation("/")}
            >
              Đăng nhập ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm z-10"
      >
        <Card className="border border-purple-500/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3 border border-purple-500/20">
              <ShieldAlert className="w-7 h-7 text-purple-400" />
            </div>
            <CardTitle className="text-xl font-bold">Xác thực Admin</CardTitle>
            <p className="text-sm text-muted-foreground">
              Nhập mật khẩu admin để kích hoạt quyền cho tài khoản{" "}
              <span className="text-purple-400 font-semibold">{user?.username}</span>
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Mật khẩu Admin Secret
              </label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  placeholder="Nhập ADMIN_SECRET..."
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && secret.trim().length >= 4 && handleSubmit()}
                  className="bg-background/50 border-border/50 focus:border-purple-500 h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !secret.trim() || secret.trim().length < 4}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/20 transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xác thực...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Kích hoạt quyền Admin
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center pt-1">
              Mật khẩu được lấy từ biến môi trường <code className="text-purple-400">ADMIN_SECRET</code> trên server.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
