import { motion } from "framer-motion";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import { User, UserPlus } from "lucide-react";
import { UserContext } from '../context/UserContext'
import { useContext } from "react";

export function Navigation({ onLoginClick, onSignupClick }) {
  const {isOauth} = useContext(UserContext);
  console.log(isOauth);
  return (
    
    <motion.div
    //   initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: "bold",
                  background: "linear-gradient(to right, #8b5cf6, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                SeaU
              </Typography>
            </motion.div>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="text"
                  startIcon={<User size={18} />}
                  onClick={onLoginClick}
                  sx={{
                    color: "text.primary",
                    "&:hover": { color: "primary.main" },
                    textTransform: "none",
                    fontSize: 14,
                  }}
                >
                  
                  {isOauth?'로그아웃':'로그인'}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  startIcon={<UserPlus size={18} />}
                  onClick={onSignupClick}
                  sx={{
                    background: "linear-gradient(to right, #8b5cf6, #3b82f6)",
                    color: "#fff",
                    textTransform: "none",
                    fontSize: 14,
                    "&:hover": {
                      background: "linear-gradient(to right, #7c3aed, #2563eb)",
                    },
                  }}
                >
                  {isOauth?'마이페이지':'회원가입'}
                </Button>
              </motion.div>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      console.log(isOauth)
    </motion.div>
  );
}
