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
import { LinearGradient } from "expo-linear-gradient"

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
        this.props.removeCard(direction, this.props.item.id)
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
      outputRange: ["-5deg", "0deg", "5deg"],
    })

    const headerTranslateY = this.scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, -100],
      extrapolate: "clamp",
    })

    const cardContainerTranslateY = this.scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [80, 0],
      extrapolate: "clamp",
    })

    const shouldShowBackButton = this.props.showBackButton && this.props.index === 0 && this.props.hasCardsToGoBack

    return (
      <View style={styles.cardWrapper}>
        <Animated.View style={[styles.livestreamsContainer, { transform: [{ translateY: headerTranslateY }] }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10, alignItems: "center" }}
          >
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <LinearGradient
                key={index}
                colors={["#783aad", "#ce8df0"]}
                style={[styles.livestreamCircle, { marginRight: 10 }]} // Adjust margin as needed
              >
                <View style={styles.livestreamInner}>
                  {index === 0 && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: -10,
                        right: -10,
                        backgroundColor: "#3B125A",
                        borderRadius: 28,
                        padding: 4,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      <Image source={require("./assets/start_livestream.png")} />
                    </View>
                  )}
                  <Image
                    source={{
                      uri: "https://imgs.search.brave.com/NvjiDs3X-4jkBgw3ssSqS8D4XpalbZyBMkNLkrb9GDI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL00v/TVY1Qk5UTTNaRE0w/T0dNdE5UZzFPUzAw/TnpjekxXRTFNVGt0/TlRsa04yRXpNamt3/T0dZNVhrRXlYa0Zx/Y0dkZVFWUm9hWEpr/VUdGeWRIbEpibWRs/YzNScGIyNVhiM0py/Wm14dmR3QEAuX1Yx/X1FMNzVfVVkyODFf/Q1IwLDAsNTAwLDI4/MV8uanBn",
                    }}
                    style={{ flex: 1, borderRadius: 28 }}
                  />
                </View>
              </LinearGradient>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View
          {...this.panResponder.panHandlers}
          style={[
            styles.cardContainer,
            {
              opacity: this.Card_Opacity,
              transform: [
                { translateX: this.state.Xposition },
                { rotate: rotateCard },
                { translateY: cardContainerTranslateY },
              ],
              height: "100%",
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
                <View style={styles.imageOverlay} />
                <View style={styles.imageOverlay2} />
                {shouldShowBackButton && (
                  <TouchableOpacity style={styles.backButton} onPress={this.props.onBackPress}>
                    <Image source={require("./assets/home_previous.png")} style={styles.image} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.giftNsticker}>
                  <Image source={require("./assets/home_gift_icon1.png")} style={styles.image} />
                  <Image source={require("./assets/home_lgbtq_heart.png")} style={styles.image} />
                </TouchableOpacity>
                <Text style={styles.nameText}>{this.props.item.name}</Text>
                <View style={styles.tagsRow}>
                  {this.props.item.tags.map((tag, index) => (
                    <View key={`${this.props.item.id}-tag-${index}`} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.giftButtonContainer}>
                <LinearGradient
                  colors={["#3a1259", "#1f0631"]}
                  style={styles.giftButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.giftButtonText}>Send a Gift</Text>
                  <Image source={require("./assets/home_gift_icon.png")} style={styles.image} />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.section}>
                <Text style={styles.bioText}>{this.props.item.bio}</Text>
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>About me</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>👩 {this.props.item.aboutMe.gender}</Text>
                  <Text style={styles.detailText}>👶 {this.props.item.aboutMe.kids}</Text>
                  <Text style={styles.detailText}>📏 {this.props.item.aboutMe.height}</Text>
                  <Text style={styles.detailText}>🍷 {this.props.item.aboutMe.drinking}</Text>
                  <Text style={styles.detailText}>♊ {this.props.item.aboutMe.zodiac}</Text>
                  <Text style={styles.detailText}>✝️ {this.props.item.aboutMe.religion}</Text>
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
                <View style={styles.detailRow}>
                  {this.props.item.interests.map((interest, index) => (
                    <Text key={`${this.props.item.id}-interest-${index}`} style={styles.detailText}>
                      {interest}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>I'm interested in</Text>
                <View style={styles.detailRow}>
                  {this.props.item.preferences.map((pref, index) => (
                    <Text key={`${this.props.item.id}-pref-${index}`} style={styles.detailText}>
                      {pref}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles.locationInfo}>
                <Image source={require("./assets/home_location_icon.png")} style={styles.image} />
                <Text style={styles.locationInfoText}>{this.props.item.distance}</Text>
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
          aboutMe: {
            gender: "Woman",
            kids: "Don't have kids",
            height: "175 cm",
            drinking: "Social drinker",
            zodiac: "Leo (Jul 23-Aug 22)",
            religion: "Agnostic",
          },
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
          aboutMe: {
            gender: "Man",
            kids: "Have kids",
            height: "182 cm",
            drinking: "Non-drinker",
            zodiac: "Virgo (Aug 23-Sep 22)",
            religion: "Christian",
          },
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
          aboutMe: {
            gender: "Woman",
            kids: "Don't have kids",
            height: "168 cm",
            drinking: "Social drinker",
            zodiac: "Libra (Sep 23-Oct 22)",
            religion: "Buddhist",
          },
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
          aboutMe: {
            gender: "Man",
            kids: "Don't have kids",
            height: "185 cm",
            drinking: "Non-drinker",
            zodiac: "Scorpio (Oct 23-Nov 21)",
            religion: "Atheist",
          },
        },
        {
          id: "5",
          name: "Olivia Brown",
          age: 29,
          distance: "4 km away",
          bio: "Environmental scientist and nature lover. Committed to sustainable living and wildlife conservation.",
          interests: ["Environment", "Sustainability", "Animals", "Hiking"],
          preferences: ["Eco-friendly products 🌿", "Volunteering 🤝", "Nature walks 🌳", "Vegan food 🥬"],
          tags: ["Museum", "Music", "Books"],
          image: "https://picsum.photos/400/600?random=5",
          aboutMe: {
            gender: "Woman",
            kids: "Have kids",
            height: "170 cm",
            drinking: "Social drinker",
            zodiac: "Sagittarius (Nov 22-Dec 21)",
            religion: "Catholic",
          },
        },
      ],
      removedCards: [],
      showBackButton: false,
    }
    this.allProfiles = [...this.state.Sample_Card_Array]
  }

  componentDidMount() {
    this.setState({
      Sample_Card_Array: this.state.Sample_Card_Array.reverse(),
    })
  }

  removeCard = (swipeDirection, id) => {
    const currentCard = this.state.Sample_Card_Array.find((x) => x.id === id)
    const newCards = this.state.Sample_Card_Array.filter((x) => x.id !== id)

    this.setState((prevState) => ({
      Sample_Card_Array: newCards,
      removedCards: [currentCard, ...prevState.removedCards],
      showBackButton: swipeDirection === "left",
    }))
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
        <View style={styles.locationHeader}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>Lagos, Nigeria</Text>
          </View>
          <View style={styles.reelButton}>
            <Image source={require("./assets/reels_icon.png")} style={styles.image} />
          </View>
        </View>
        {this.state.Sample_Card_Array.length > 0 ? (
          this.state.Sample_Card_Array.map((item, index) => (
            <SwipeableCard
              key={item.id}
              item={item}
              index={index}
              removeCard={(swipeDirection) => this.removeCard(swipeDirection, item.id)}
              onBackPress={this.goToPreviousCard}
              showBackButton={this.state.showBackButton}
              hasCardsToGoBack={this.state.removedCards.length > 0}
            />
          ))
        ) : (
          <View style={styles.noProfilesContainer}>
            <View style={[styles.livestreamsContainerINN]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10, alignItems: "center" }}
              >
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                  <LinearGradient
                    key={index}
                    colors={["#783aad", "#ce8df0"]}
                    style={[styles.livestreamCircle, { marginRight: 10 }]} // Adjust margin as needed
                  >
                    <View style={styles.livestreamInner}>
                      {index === 0 && (
                        <View
                          style={{
                            position: "absolute",
                            bottom: -10,
                            right: -10,
                            backgroundColor: "#3B125A",
                            borderRadius: 28,
                            padding: 4,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderWidth: 2,
                            borderColor: "#fff",
                            zIndex: 1,
                          }}
                        >
                          <Image source={require("./assets/start_livestream.png")} />
                        </View>
                      )}
                      <Image
                        source={{
                          uri: "https://imgs.search.brave.com/NvjiDs3X-4jkBgw3ssSqS8D4XpalbZyBMkNLkrb9GDI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL00v/TVY1Qk5UTTNaRE0w/T0dNdE5UZzFPUzAw/TnpjekxXRTFNVGt0/TlRsa04yRXpNamt3/T0dZNVhrRXlYa0Zx/Y0dkZVFWUm9hWEpr/VUdGeWRIbEpibWRs/YzNScGIyNVhiM0py/Wm14dmR3QEAuX1Yx/X1FMNzVfVVkyODFf/Q1IwLDAsNTAwLDI4/MV8uanBn",
                        }}
                        style={{ flex: 1, borderRadius: 28 }}
                      />
                    </View>
                  </LinearGradient>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.noProfilesText}>No more profiles available 😔</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => this.setState({ Sample_Card_Array: [...this.allProfiles].reverse() })}
            >
              <Text style={styles.refreshButtonText}>Refresh Profiles</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  locationHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
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
    paddingHorizontal: 25,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: "#f0e6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  livestreamsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 100,
    height: 80,
  },
  livestreamsContainerINN: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    left: 0,
    right: 0,
    top: 60,
    zIndex: 100,
    height: 80,
  },
  livestreamCircle: {
    width: 65,
    height: 65,
    borderRadius: 100,
    padding: 4,
  },
  livestreamInner: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  cardWrapper: {
    marginTop: 60,
    position: "relative",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    borderRadius: 20,
    zIndex: 1,
    marginTop: 10,
    overflow: "hidden",
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
    height: 550,
  },
  mainImage: {
    width: "100%",
    height: 550,
    borderRadius: 30,
    zIndex: 1000,
  },
  imageOverlay: {
    position: "absolute",
    top: 25,
    left: 5,
    width: "90%",
    height: "100%",
    backgroundColor: "#efdeff",
    borderRadius: 40,
    shadowColor: "rgba(128, 0, 128, 0.9)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  imageOverlay2: {
    position: "absolute",
    top: 10,
    left: -5,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 30,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 5,
    backgroundColor: "#3B125A",
    borderRadius: 100,
    zIndex: 2000,
  },
  giftNsticker: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 2000,
    padding: 4,
    paddingTop: 15,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 100,
    justifyContent: "space-between",
    gap: 10,
    backdropFilter: "blur(10px)",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    position: "absolute",
    bottom: 60,
    left: 25,
    zIndex: 10000,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    position: "absolute",
    bottom: 20,
    left: 25,
    zIndex: 10000,
    justifyContent: "flex-end",
  },
  tag: {
    backgroundColor: "#cfcfcf5d",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#f2f2f2",
    fontSize: 12,
    fontWeight: "bold",
  },
  giftButtonContainer: {
    alignSelf: "flex-start",
    marginVertical: 16,
    marginTop: 30,
  },
  giftButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  giftButtonText: {
    color: "#ba84e6",
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5d5d5d",
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
    flexWrap: "wrap",
  },
  detailText: {
    fontSize: 13,
    fontWeight: 400,
    color: "#3B125A",
    marginRight: 16,
    backgroundColor: "#f3e4ff",
    padding: 8,
    borderRadius: 100,
    paddingHorizontal: 10,
    fontWeight: 500,
    marginTop: 10,
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
  preferencesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  preferenceText: {
    color: "#100b15",
    fontSize: 16,
    backgroundColor: "#f3e5ff",
    padding: 8,
    borderRadius: 100,
    paddingHorizontal: 10,
    marginRight: 16,
    marginBottom: 8,
  },
  locationInfo: {
    marginTop: 16,
    marginBottom: 200,
    flexDirection: "row",
  },
  locationInfoText: {
    fontSize: 16,
    color: "#595757",
    fontWeight: 700,
  },
  noProfilesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
  },
  noProfilesText: {
    fontSize: 18,
    color: "#3B125A",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  refreshButton: {
    backgroundColor: "#f3e4ff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: "#3B125A",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default App

