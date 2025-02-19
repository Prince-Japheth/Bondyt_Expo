import React from "react"
import { StyleSheet, View, Text, Dimensions, Animated, PanResponder, Image, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import ImageViewer from "./ImageViewer"

const SCREEN_WIDTH = Dimensions.get("window").width
const SCREEN_HEIGHT = Dimensions.get("window").height

const styles = StyleSheet.create({
  cardWrapper: {
    width: SCREEN_WIDTH - 20,
    height: 500,
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 10,
    marginVertical: 10,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 16,
    color: "#555",
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  mediaImage: {
    width: 70,
    height: 70,
    marginRight: 10,
    marginBottom: 10,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
})

class SwipeableCard extends React.Component {
  constructor() {
    super()
    this.state = {
      Xposition: new Animated.Value(0),
      LeftText: false,
      RightText: false,
      isScrollEnabled: true,
      imageViewerVisible: false,
      selectedImageIndex: 0,
    }

    this.Card_Opacity = new Animated.Value(1)
    this.panResponder = this.createPanResponder()
    this.scrollY = new Animated.Value(0)
  }

  createPanResponder = () => {
    return PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        this.state.Xposition.setValue(gestureState.dx)
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 100) {
          this.props.onSwipeRight(this.props.item)
        } else if (gestureState.dx < -100) {
          this.props.onSwipeLeft(this.props.item)
        } else {
          Animated.spring(this.state.Xposition, {
            toValue: 0,
            friction: 4,
            tension: 100,
          }).start()
        }
      },
    })
  }

  handleImagePress = (index) => {
    this.setState({
      imageViewerVisible: true,
      selectedImageIndex: index,
    })
  }

  render() {
    const cardOpacity = this.Card_Opacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    })

    const animatedCardStyle = {
      transform: [{ translateX: this.state.Xposition }],
      opacity: cardOpacity,
    }

    return (
      <View style={styles.cardWrapper}>
        <Animated.View style={[styles.card, animatedCardStyle]} {...this.panResponder.panHandlers}>
          <Image source={{ uri: this.props.item.image }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{this.props.item.name}</Text>
            <Text style={styles.cardDescription}>{this.props.item.description}</Text>
          </View>
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.gradient} />
        </Animated.View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          <View style={styles.mediaGrid}>
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <TouchableOpacity key={index} onPress={() => this.handleImagePress(index)}>
                <Image source={{ uri: this.props.item.image }} style={styles.mediaImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ImageViewer
          visible={this.state.imageViewerVisible}
          images={Array(6).fill(this.props.item.image)}
          initialIndex={this.state.selectedImageIndex}
          onClose={() => this.setState({ imageViewerVisible: false })}
          userName={this.props.item.name}
          age={this.props.item.age}
        />
      </View>
    )
  }
}

export default SwipeableCard

