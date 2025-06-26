import { useState, useContext } from "react";
import axios from "axios";
import { Box, Typography, Button } from "@mui/material";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";  // 경로는 환경에 맞게 조정

export default function Login({ formData, onChange}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUserId, setIsOauth } = useContext(UserContext);
  const nav = useNavigate();

  const tryLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3001/login", {
        id: formData.id,       // 아이디는 formData.email
        pw: formData.password,    // 비밀번호는 formData.password
      });

      if (res.data === "인증성공") {
        console.log("로그인 성공:", res.data);
        setUserId(formData.id);
        setIsOauth(true);
        nav("/home1");
      } else if (res.data === "인증실패") {
        console.log("로그인 실패", res.data);
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      console.log("로그인 실패:", err);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={tryLogin}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          아이디
        </Typography>
        <Box sx={{ position: "relative" }}>
          <Mail
            size={20}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          />
          <input
            type="text"
            value={formData.id}
            onChange={(e) => onChange("id", e.target.value)}
            placeholder="아이디를 입력하세요"
            required
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: 16,
              boxSizing: "border-box",
            }}
          />
        </Box>
      </div>

      <div>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          비밀번호
        </Typography>
        <Box sx={{ position: "relative" }}>
          <Lock
            size={20}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
            style={{
              width: "100%",
              padding: "10px 44px 10px 36px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: 16,
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </Box>
      </div>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ py: 1.5, mt: 2 }}
        disabled={loading}
      >
        {loading ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
