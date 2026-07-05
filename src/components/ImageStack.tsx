"use client";

import { useState, useRef } from "react";
import styles from "./ImageStack.module.css";

interface ImageStackProps {
  images: string[];
  alt: string;
}

export default function ImageStack({ images, alt }: ImageStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const startPos = useRef({ x: 0, y: 0 });
  const stackRef = useRef<HTMLDivElement>(null);

  // Get index with circular offset
  const getCardIndex = (offset: number) => {
    return (currentIndex + offset) % images.length;
  };

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 120; // swipe threshold in px
    if (dragOffset.x > threshold) {
      triggerSwipe("right");
    } else if (dragOffset.x < -threshold) {
      triggerSwipe("left");
    } else {
      // Bounce back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerSwipe = (dir: "left" | "right") => {
    // Fly off screen
    setDragOffset({
      x: dir === "right" ? 600 : -600,
      y: dragOffset.y * 1.5,
    });

    // Delay update to let transition play
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  // Drag handlers for mouse
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    handleEnd();
  };

  const onMouseLeave = () => {
    handleEnd();
  };

  // Swipe buttons fallbacks
  const handleNext = () => {
    triggerSwipe("right");
  };

  const handlePrev = () => {
    // Animate current card left then instantly select previous card
    setDragOffset({ x: -600, y: 0 });
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setDragOffset({ x: 0, y: 0 });
    }, 200);
  };

  return (
    <div className={styles.stackContainer} ref={stackRef}>
      {/* Cards Deck */}
      <div 
        className={styles.deck}
        onMouseMove={isDragging ? onMouseMove : undefined}
        onMouseUp={isDragging ? onMouseUp : undefined}
        onMouseLeave={isDragging ? onMouseLeave : undefined}
      >
        {/* Render bottom card (depth 2), middle card (depth 1), and top card (depth 0) */}
        {[2, 1, 0].map((depth) => {
          const imgIndex = getCardIndex(depth);
          const isTopCard = depth === 0;

          let cardStyle: React.CSSProperties = {};

          if (isTopCard) {
            cardStyle = {
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`,
              transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15)",
              zIndex: 3,
              cursor: isDragging ? "grabbing" : "grab",
            };
          } else if (depth === 1) {
            // Middle card scales up slightly as top card moves
            const progress = Math.min(Math.abs(dragOffset.x) / 300, 1);
            const scale = 0.95 + progress * 0.05;
            const translateY = 16 - progress * 16;
            const rotate = -3 + progress * 3;

            cardStyle = {
              transform: `scale(${scale}) translateY(${translateY}px) rotate(${rotate}deg)`,
              transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15)",
              zIndex: 2,
              opacity: 0.95,
            };
          } else {
            // Bottom card scales up as top card moves
            const progress = Math.min(Math.abs(dragOffset.x) / 300, 1);
            const scale = 0.9 + progress * 0.05;
            const translateY = 32 - progress * 16;
            const rotate = 3 - progress * 6;

            cardStyle = {
              transform: `scale(${scale}) translateY(${translateY}px) rotate(${rotate}deg)`,
              transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15)",
              zIndex: 1,
              opacity: 0.7,
            };
          }

          return (
            <div
              key={imgIndex}
              className={styles.card}
              style={cardStyle}
              onMouseDown={isTopCard ? onMouseDown : undefined}
              onTouchStart={
                isTopCard
                  ? (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)
                  : undefined
              }
              onTouchMove={
                isTopCard
                  ? (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)
                  : undefined
              }
              onTouchEnd={isTopCard ? handleEnd : undefined}
            >
              <img src={images[imgIndex]} alt={`${alt} - ${imgIndex}`} className={styles.cardImage} />
              
              {isTopCard && (
                <div className={styles.swipeHint}>
                  <span className={`material-symbols-outlined`} style={{ fontSize: "1rem" }}>swipe</span>
                  <span>Vuốt hoặc click mũi tên để chuyển ảnh</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Swipe controls */}
      <div className={styles.controls}>
        <button className={styles.controlBtn} onClick={handlePrev} title="Ảnh trước">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className={`mono-text ${styles.counter}`}>
          {currentIndex + 1} / {images.length}
        </div>
        <button className={styles.controlBtn} onClick={handleNext} title="Ảnh sau">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
