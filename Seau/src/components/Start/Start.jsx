import React from 'react'
import { AuthSidebar } from './AuthSiderbar'
import { Typography } from "@mui/material";
import { motion} from "framer-motion";

const Start = ({ isOpen, onClose, initialMode }) => {
  return (
    <div>

        <AuthSidebar isOpen={isOpen} onClose={onClose} initialMode={initialMode} />

      <div style={{ backgroundColor: 'black', height: '5000px' }}>
        <br />
      <br />

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{
          duration: 1.4,
          y: { duration: 1 }
        }}
        style={{marginTop:'250px'}}>
        <Typography
          variant="h2"
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

          <div style={{height: '500px'}}>

          </div>

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

      </div>
    </div>
  )
}

export default Start