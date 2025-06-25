import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardContent, CardHeader, Typography, Box } from "@mui/material";
import { X } from "lucide-react";
import Login2 from "./Login2";
import Join2 from "./Join2";

export function AuthSidebar({ isOpen, onClose, initialMode }) {
  const [mode, setMode] = useState(initialMode || "login");

  useEffect(() => {
    setMode(initialMode || "login");
  }, [initialMode]);

  const [formData, setFormData] = useState({
    id: "",
    password: "",
    name: "",
    confirmPassword: "",
  });

  const handleSubmit = () => {
    console.log(`${mode} submitted:`, formData);
    alert(`${mode === "login" ? "로그인" : "회원가입"} 요청이 전송되었습니다!`);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1300 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              height: "100%",
              width: "100%",
              maxWidth: 400,
              backgroundColor: "#fff",
              boxShadow: "0 0 20px rgba(0,0,0,0.3)",
              zIndex: 1301,
              overflowY: "auto",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <Box p={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                  {mode === "login" ? "로그인" : "회원가입"}
                </Typography>
                <Button variant="text" size="small" onClick={onClose} sx={{ minWidth: 0, p: 1 }}>
                  <X size={20} />
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  p: 0.5,
                  mb: 4,
                }}
              >
                {["login", "signup"].map((m) => (
                  <Button
                    key={m}
                    onClick={() => setMode(m)}
                    sx={{
                      flex: 1,
                      borderRadius: 1,
                      textTransform: "none",
                      fontWeight: "medium",
                      color: mode === m ? "primary.main" : "text.secondary",
                      bgcolor: mode === m ? "background.paper" : "transparent",
                      boxShadow: mode === m ? 1 : "none",
                      "&:hover": {
                        color: "primary.dark",
                        bgcolor: mode === m ? "background.paper" : "grey.200",
                      },
                    }}
                  >
                    {m === "login" ? "로그인" : "회원가입"}
                  </Button>
                ))}
              </Box>

              <Card variant="outlined" sx={{ boxShadow: 3 }}>
                <CardHeader
                  title={
                    <Typography variant="h6" align="center" sx={{ fontWeight: "medium" }}>
                      {mode === "login" ? "계정에 로그인하세요" : "새 계정을 만드세요"}
                    </Typography>
                  }
                />
                <CardContent>
                  {mode === "login" ? (
                    <Login2 formData={formData} onChange={handleInputChange} onSubmit={handleSubmit} />
                  ) : (
                    <Join2 formData={formData} onChange={handleInputChange} onSubmit={handleSubmit} />
                  )}

                  {mode === "login" && (
                    <Box mt={2} textAlign="center">
                      <a href="#" style={{ fontSize: 14, color: "#7c3aed", textDecoration: "none" }}>
                        비밀번호를 잊으셨나요?
                      </a>
                    </Box>
                  )}

                  <Box mt={3} textAlign="center" sx={{ fontSize: 14, color: "text.secondary" }}>
                    {mode === "login" ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
                    <Button
                      onClick={() => setMode(mode === "login" ? "signup" : "login")}
                      sx={{ color: "primary.main", textTransform: "none", fontWeight: "medium", minWidth: "auto", p: 0 }}
                    >
                      {mode === "login" ? "회원가입" : "로그인"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
