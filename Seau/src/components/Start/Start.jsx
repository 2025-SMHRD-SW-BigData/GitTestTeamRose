import React from 'react'
import { AuthSidebar } from './AuthSiderbar'
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const Start = ({ isOpen, onClose, initialMode }) => {
  return (
    <body style={{ backgroundColor: 'black', height: '5000px' }}>
      <AuthSidebar isOpen={isOpen} onClose={onClose} initialMode={initialMode} />
      <br />
      <br />

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{
          duration: 1.4,
          y: { duration: 1 }
        }}
        style={{marginTop:'300px'}}>
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(to right, #8b5cf6, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          <h1>SeaU</h1>
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{
          ease: "easeInOut",
          duration: 2,
          y: { duration: 1 },
        }}
        style={{ color: 'white' }}
      >
        <div>
          여기에 콘텐츠가 들어갑니다.
        </div>
      </motion.div>
      <br />
      <br />
      <br />
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{
          ease: 'easeInOut',
          duration: 2,
          x: { duration: 1 },
        }}
        style={{ color: 'white', marginTop: '800px', marginBottom: '1000px' }}
      >
        <h1>ㅎㅇ</h1>
      </motion.div>

    </body>
  )
}

export default Start