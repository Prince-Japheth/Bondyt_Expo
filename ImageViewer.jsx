"use client"

import React from "react"
import {
  View,
  Modal,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"

const SCREEN_WIDTH = Dimensions.get("window").width

const ImageViewer = ({ images, initialIndex, visible, onClose, userName, age }) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex)
  const [xPosition] = React.useState(new Animated.Value(0))

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          xPosition.setValue(gestureState.dx)
        },
        onPanResponderRelease: (_, gestureState) => {
          if (Math.abs(gestureState.dx) > SCREEN_WIDTH * 0.4) {
            const newIndex =
              gestureState.dx > 0 ? Math.max(0, currentIndex - 1) : Math.min(images.length - 1, currentIndex + 1)

            if (newIndex !== currentIndex) {
              setCurrentIndex(newIndex)
              xPosition.setValue(0)
            } else {
              Animated.spring(xPosition, {
                toValue: 0,
                useNativeDriver: true,
              }).start()
            }
          } else {
            Animated.spring(xPosition, {
              toValue: 0,
              useNativeDriver: true,
            }).start()
          }
        },
      }),
    [currentIndex, images.length, xPosition],
  )

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.container}>
        <LinearGradient colors={["rgba(0,0,0,0.7)", "transparent"]} style={styles.gradient}>
          <View style={styles.progressContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: index === currentIndex ? "#783aad" : "#ffffff",
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.header}>
            <Text style={styles.headerText}>{`${userName}, ${age}`}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <View style={styles.closeButtonInner}>
                <Text style={styles.closeButtonText}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [{ translateX: xPosition }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Image source={{ uri: images[currentIndex] }} style={styles.image} resizeMode="contain" />
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton}>
            <Image source={require("./assets/home_gift_icon1.png")} style={styles.footerIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Image source={require("./assets/home_lgbtq_heart.png")} style={styles.footerIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 2,
    paddingTop: 40,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 4,
  },
  progressBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    width: 32,
    height: 32,
  },
  closeButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B125A",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    right: 20,
    flexDirection: "row",
    gap: 10,
  },
  footerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  footerIcon: {
    width: 24,
    height: 24,
  },
})

export default ImageViewer

