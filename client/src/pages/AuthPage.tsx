import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Gift, LockKeyhole, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";


const getFriendlyAuthError = (error: Error | null, isRegister: boolean): string => {
  const message = error?.message ?? "";
  const normalized = message.toLowerCase();

  if (/failed query|sql|mysql|database|drizzle|er_[a-z0-9_]+|select `|insert `|unknown column|table .* doesn't exist/.test(normalized)) {
    return isRegister
      ? "Hệ thống đăng ký đang tạm thời gặp lỗi dữ liệu. Vui lòng thử lại sau ít phút hoặc liên hệ hỗ trợ."
      : "Hệ thống đăng nhập đang tạm thời gặp lỗi dữ liệu. Vui lòng thử lại sau ít phút hoặc liên hệ hỗ trợ.";
  }

  if (normalized.includes("username already taken")) return "Username này đã được sử dụng. Vui lòng chọn username khác.";
  if (normalized.includes("user not found")) return "Không tìm thấy tài khoản này.";
  if (normalized.includes("incorrect password")) return "Mật khẩu không chính xác.";

  return isRegister
    ? "Không thể đăng ký lúc này. Vui lòng kiểm tra thông tin và thử lại."
    : "Không thể đăng nhập lúc này. Vui lòng kiểm tra thông tin và thử lại.";
};

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, login, register } = useAuth();
  const isRegister = location.pathname === "/register";


  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [refCode, setRefCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");


  useEffect(() => {
    if (user && !loading) navigate("/dashboard", { replace: true });
  }, [loading, navigate, user]);


  const switchMode = (registerMode: boolean) => {
    setError("");
    setNotice("");
    navigate(registerMode ? "/register" : "/login");
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");


    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      setError("Username phải có ít nhất 3 ký tự.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError("Username chỉ được dùng chữ cái, số và dấu gạch dưới.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }


    setSubmitting(true);
    try {
      const result = isRegister
        ? await register(cleanUsername, password, refCode.trim() || undefined)
        : await login(cleanUsername, password);


      if (result.error) {
        setError(getFriendlyAuthError(result.error, isRegister));
        return;
      }


      setNotice(isRegister ? "Đăng ký thành công. Đang mở tài khoản của bạn…" : "Đăng nhập thành công.");
      navigate("/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
