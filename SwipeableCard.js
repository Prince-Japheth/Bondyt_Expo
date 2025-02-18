// SwipeableCard.js
import React, { Component } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';

const SCREEN_WIDTH = Dimensions.get('window').width;

class SwipeableCard extends Component {
  constructor() {
    super();
    this.state = {
      Xposition: new Animated.Value(0),
      LeftText: false,
      RightText: false,
      isScrollEnabled: true,
    };
    this.Card_Opacity = new Animated.Value(1);
    this.panResponder = this.createPanResponder();
  }

  createPanResponder = () => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return !this.state.isScrollEnabled && (Math.abs(dx) > 5 || Math.abs(dy) > 5);
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        const resistance = 0.7;
        this.state.Xposition.setValue(dx * resistance);
        this.setState({ LeftText: dx < -SCREEN_WIDTH + 250, RightText: dx > SCREEN_WIDTH - 250 });
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        if (dx < -SCREEN_WIDTH + 150 && vx < -0.7) {
          this.swipeCard('left');
        } else if (dx > SCREEN_WIDTH - 150 && vx > 0.7) {
          this.swipeCard('right');
        } else {
          this.resetPosition();
        }
      },
    });
  };

  swipeCard = (direction) => {
    Animated.parallel([
      Animated.timing(this.state.Xposition, {
        toValue: direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH,
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
        this.props.removeCard(direction);
      });
    });
  };

  resetPosition = () => {
    Animated.spring(this.state.Xposition, {
      toValue: 0,
      speed: 20,
      bounciness: 8,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ LeftText: false, RightText: false, isScrollEnabled: true });
    });
  };

  render() {
    const rotateCard = this.state.Xposition.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: ['-20deg', '0deg', '20deg'],
    });

    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={[styles.cardContainer, { transform: [{ translateX: this.state.Xposition }, { rotate: rotateCard }] }]}
      >
        <ScrollView style={styles.scrollView} scrollEnabled={this.state.isScrollEnabled}>
          <Image source={{ uri: this.props.item.image }} style={styles.mainImage} />
          <Text style={styles.nameText}>{this.props.item.name}</Text>
        </ScrollView>
      </Animated.View>
    );
  }
}

export default SwipeableCard;
