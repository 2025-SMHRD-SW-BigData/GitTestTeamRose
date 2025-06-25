import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { User, Mail, Lock } from "lucide-react";
import axios from "axios";

export default function Join({ formData, onChange }) {
  const [loading, setLoading] = useState(false);

  const tryJoin = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("http://localhost:3001", {
        id: formData.id,
        pw: formData.password,
        name: formData.name
      })
      .then((res) => {
        if (res.data === "가입성공") {
          alert("회원가입이 완료되었습니다!");
          // 필요한 추가 처리 (예: 모달 닫기 등) 여기서 하세요
        } else {
          alert("회원가입에 실패했습니다.");
        }
      })
      .catch((err) => {
        console.error("회원가입 실패: ", err);
        alert("오류가 발생했습니다. 다시 시도해주세요.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <form
      onSubmit={tryJoin}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          이름
        </Typography>
        <Box sx={{ position: "relative" }}>
          <User
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
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="이름을 입력하세요"
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
            type="password"
            value={formData.password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="비밀번호를 입력하세요"
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
          비밀번호 확인
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
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => onChange("confirmPassword", e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
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

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ py: 1.5, mt: 2 }}
        disabled={loading}
      >
        {loading ? "가입 중..." : "회원가입"}
      </Button>
    </form>
  );
}
