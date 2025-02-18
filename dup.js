import React from "react"
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Animated,
  PanResponder,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

const SCREEN_WIDTH = Dimensions.get("window").width
const SCREEN_HEIGHT = Dimensions.get("window").height

class SwipeableCard extends React.Component {
  constructor() {
    super()
    this.state = {
      Xposition: new Animated.Value(0),
      LeftText: false,
      RightText: false,
      isScrollEnabled: true,
    }

    this.Card_Opacity = new Animated.Value(1)
    this.panResponder = this.createPanResponder()
    this.scrollY = new Animated.Value(0)
    this.headerTranslateY = new Animated.Value(0)
  }

  createPanResponder = () => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState
        return Math.abs(dx) > 10 && Math.abs(dy) < 10
      },
      onPanResponderGrant: () => {
        this.setState({ isScrollEnabled: false })
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState
        const resistance = 0.7
        const newX = dx * resistance

        this.state.Xposition.setValue(newX)

        if (dx < -SCREEN_WIDTH + 250) {
          this.setState({ LeftText: true, RightText: false })
        } else if (dx > SCREEN_WIDTH - 250) {
          this.setState({ LeftText: false, RightText: true })
        } else {
          this.setState({ LeftText: false, RightText: false })
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState

        if (dx < -SCREEN_WIDTH / 3 && vx < -0.3) {
          this.swipeCard("left")
        } else if (dx > SCREEN_WIDTH / 3 && vx > 0.3) {
          this.swipeCard("right")
        } else {
          this.resetPosition()
        }
      },
      onPanResponderTerminate: () => {
        this.resetPosition()
      },
    })
  }

  swipeCard = (direction) => {
    Animated.parallel([
      Animated.timing(this.state.Xposition, {
        toValue: direction === "left" ? -SCREEN_WIDTH : SCREEN_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(this.Card_Opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.setState({ LeftText: false, RightText: false, isScrollEnabled: true }, () => {
        this.props.removeCard(direction)
      })
    })
  }

  resetPosition = () => {
    Animated.spring(this.state.Xposition, {
      toValue: 0,
      speed: 20,
      bounciness: 8,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ LeftText: false, RightText: false, isScrollEnabled: true })
    })
  }

  handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    this.scrollY.setValue(offsetY)
  }

  render() {
    const rotateCard = this.state.Xposition.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: ["-20deg", "0deg", "20deg"],
    })

    const headerTranslateY = this.scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, -150],
      extrapolate: 'clamp',
    })

    const shouldShowBackButton = this.props.showBackButton && this.props.index === 0 && this.props.hasCardsToGoBack

    return (
      <View>

      <View style={styles.locationHeader}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Lagos, Nigeria</Text>
        </View>
        <View style={styles.reelButton}>
          <Text style={styles.reelIcon}>📷</Text>
        </View>
      </View>

        <Animated.View style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateY }] }
        ]}>

          <View style={styles.storiesContainer}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View key={index} style={styles.storyCircle}>
                <View style={styles.storyInner} />
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          {...this.panResponder.panHandlers}
          style={[
            styles.cardContainer,
            {
              opacity: this.Card_Opacity,
              transform: [{ translateX: this.state.Xposition }, { rotate: rotateCard }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            bounces={true}
            scrollEventThrottle={16}
            scrollEnabled={this.state.isScrollEnabled}
            onScrollBeginDrag={() => this.setState({ isScrollEnabled: true })}
            onScrollEndDrag={() => this.setState({ isScrollEnabled: true })}
            onScroll={this.handleScroll}
          >
            <View style={styles.cardContent}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: this.props.item.image }} style={styles.mainImage} />
                {shouldShowBackButton && (
                  <TouchableOpacity style={styles.backButton} onPress={this.props.onBackPress}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.nameText}>{this.props.item.name}</Text>
              <View style={styles.tagsRow}>
                {this.props.item.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.giftButton}>
                <Text style={styles.giftButtonText}>Send a Gift 🎁</Text>
              </TouchableOpacity>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About me</Text>
                <Text style={styles.bioText}>{this.props.item.bio}</Text>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>👩 Woman</Text>
                  <Text style={styles.detailText}>🚫 Don't have kids</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>📏 182 cm</Text>
                  <Text style={styles.detailText}>🌟 I am sober</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>♊ Gemini (May 21-June 21)</Text>
                  <Text style={styles.detailText}>✝️ Christian</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Media</Text>
                <View style={styles.mediaGrid}>
                  {[1, 2, 3, 4, 5, 6].map((_, index) => (
                    <Image key={index} source={{ uri: this.props.item.image }} style={styles.mediaImage} />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>I'm looking for</Text>
                <View style={styles.interestsContainer}>
                  {this.props.item.interests.map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>I'm interested in</Text>
                <View style={styles.preferencesContainer}>
                  {this.props.item.preferences.map((pref, index) => (
                    <Text key={index} style={styles.preferenceText}>
                      {pref}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles.locationInfo}>
                <Text style={styles.locationInfoText}>📍 Abuja, 5 km away</Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    )
  }
}

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      Sample_Card_Array: [
        {
          id: "1",
          name: "Sarah Johnson",
          age: 28,
          distance: "5 km away",
          bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut suscipit vel Lorem ipsum dolor sit amet.",
          interests: ["Leadership", "Business", "Humor", "Loyalty"],
          preferences: ["Dancing 💃", "Horror movies 🎬", "football⚽️", "wine 🍷"],
          tags: ["Kind", "Funny", "Smart"],
          image: "https://picsum.photos/400/600?random=1",
        },
        {
          id: "2",
          name: "Michael Smith",
          age: 32,
          distance: "3 km away",
          bio: "Passionate about technology and innovation. Love to travel and explore new places.",
          interests: ["Technology", "Travel", "Photography", "Food"],
          preferences: ["Hiking 🏃‍♂️", "Movies 🎬", "Cooking 👨‍🍳", "Coffee ☕"],
          tags: ["Adventurous", "Foodie", "Techy"],
          image: "https://picsum.photos/400/600?random=2",
        },
        {
          id: "3",
          name: "Emily Davis",
          age: 26,
          distance: "7 km away",
          bio: "Art enthusiast and freelance designer. Always looking for new inspiration and creative projects.",
          interests: ["Art", "Design", "Music", "Yoga"],
          preferences: ["Galleries 🎨", "Concerts 🎵", "Meditation 🧘‍♀️", "Tea 🍵"],
          tags: ["Creative", "Calm", "Artistic"],
          image: "https://picsum.photos/400/600?random=3",
        },
        {
          id: "4",
          name: "David Wilson",
          age: 30,
          distance: "2 km away",
          bio: "Fitness trainer and nutrition coach. Passionate about helping others achieve their health goals.",
          interests: ["Fitness", "Nutrition", "Outdoor Activities", "Cooking"],
          preferences: ["Gym 💪", "Healthy eating 🥗", "Running 🏃‍♂️", "Smoothies 🥤"],
          tags: ["Fit", "Motivated", "Health-conscious"],
          image: "https://picsum.photos/400/600?random=4",
        },
        {
          id: "5",
          name: "Olivia Brown",
          age: 29,
          distance: "4 km away",
          bio: "Environmental scientist and nature lover. Committed to sustainable living and wildlife conservation.",
          interests: ["Environment", "Sustainability", "Animals", "Hiking"],
          preferences: ["Eco-friendly products 🌿", "Volunteering 🤝", "Nature walks 🌳", "Vegan food 🥬"],
          tags: ["Eco-conscious", "Compassionate", "Outdoorsy"],
          image: "https://picsum.photos/400/600?random=5",
        },
      ],
      No_More_Card: false,
      removedCards: [],
      showBackButton: false,
    }
  }

  componentDidMount() {
    this.setState({
      Sample_Card_Array: this.state.Sample_Card_Array.reverse(),
    })

    if (this.state.Sample_Card_Array.length == 0) {
      this.setState({ No_More_Card: true })
    }
  }

  removeCard = (swipeDirection, id) => {
    const currentCard = this.state.Sample_Card_Array.find((x) => x.id === id)
    const newCards = this.state.Sample_Card_Array.filter((x) => x.id !== id)

    this.setState(
      (prevState) => ({
        Sample_Card_Array: newCards,
        removedCards: [currentCard, ...prevState.removedCards],
        showBackButton: true,
      }),
      () => {
        if (this.state.Sample_Card_Array.length === 0) {
          this.setState({ No_More_Card: true })
        }
      },
    )
  }

  goToPreviousCard = () => {
    if (this.state.removedCards.length > 0) {
      const [previousCard, ...remainingRemovedCards] = this.state.removedCards

      this.setState((prevState) => ({
        Sample_Card_Array: [previousCard, ...prevState.Sample_Card_Array],
        removedCards: remainingRemovedCards,
        showBackButton: remainingRemovedCards.length > 0,
      }))
    }
  }

  render() {
    return (
      <View style={styles.MainContainer}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        {this.state.Sample_Card_Array.map((item, index) => (
          <SwipeableCard
            key={item.id}
            item={item}
            index={index}
            removeCard={(swipeDirection) => this.removeCard(swipeDirection, item.id)}
            onBackPress={this.goToPreviousCard}
            showBackButton={this.state.showBackButton}
            hasCardsToGoBack={this.state.removedCards.length > 0}
          />
        ))}

        {this.state.No_More_Card ? <Text style={{ fontSize: 22, color: "#000" }}>No more profiles!</Text> : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  reelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0e6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  storiesContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-around",
  },
  storyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0e6ff",
    padding: 2,
  },
  storyInner: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    borderRadius: 20,
    marginTop: 80,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  cardContent: {
    padding: 16,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  mainImage: {
    width: "100%",
    height: 400,
    borderRadius: 20,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#f0e6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#6200ee",
    fontSize: 14,
  },
  giftButton: {
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 16,
  },
  giftButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  detailsContainer: {
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    marginRight: 16,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  mediaImage: {
    width: (SCREEN_WIDTH - 48) / 3,
    height: (SCREEN_WIDTH - 48) / 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    backgroundColor: "#f0e6ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: "#6200ee",
    fontSize: 14,
  },
  preferencesContainer: {
    marginTop: 8,
  },
  preferenceText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  locationInfo: {
    marginTop: 16,
  },
  locationInfoText: {
    fontSize: 16,
    color: "#666",
  },
})

export default App