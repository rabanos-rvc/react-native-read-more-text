import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default class ReadMore extends React.Component {
  state = {
    measured: false,
    shouldShowReadMore: false,
    showAllText: false
  };

  async componentDidMount() {
    this._isMounted = true;
    await nextFrameAsync();

    if (!this._isMounted) {
      return;
    }

    // Get the height of the text with no restriction on number of lines
    const fullHeight = await measureHeightAsync(this._text);
    this.setState({ measured: true });
    await nextFrameAsync();

    if (!this._isMounted) {
      return;
    }

    // Get the height of the text now that number of lines has been set
    const limitedHeight = await measureHeightAsync(this._text);

    if (fullHeight > limitedHeight) {
      this.setState({ shouldShowReadMore: true }, () => {
        this.props.onReady && this.props.onReady();
      });
    } else {
      this.props.onReady && this.props.onReady();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    let { measured, showAllText } = this.state;

    let { numberOfLines } = this.props;

    return (
      <View>
        <Text
          numberOfLines={measured && !showAllText ? numberOfLines : 0}
          ref={text => {
            this._text = text;
          }}
        >
          {this.props.children}
        </Text>

        {this._maybeRenderReadMore()}
      </View>
    );
  }

  _handlePressReadMore = () => {
    this.setState({ showAllText: true });
  };

  _handlePressReadLess = () => {
    this.setState({ showAllText: false });
  };

  _maybeRenderReadMore() {
    let { shouldShowReadMore, showAllText } = this.state;

    if (shouldShowReadMore && !showAllText) {
      return (
        <Text style={styles.button} onPress={this._handlePressReadMore}>
          { this.props.renderTruncatedFooter }
        </Text>
      );
    } else if (shouldShowReadMore && showAllText) {
      return (
        <Text style={styles.button} onPress={this._handlePressReadLess}>
          { this.props.renderRevealedFooter }
        </Text>
      );
    }
  }
}

function measureHeightAsync(component) {
  return new Promise(resolve => {
    if (Platform.OS === 'android') {
      component.measureInWindow((x, y, w, h) => {
        resolve(h);
      });
    }
    else {
      component.measure((x, y, w, h) => {
        resolve(h);
      });
    }
  });
}

function nextFrameAsync() {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

const styles = StyleSheet.create({
  button: {
    color: "#1fa5ff",
    marginTop: 5,
    textAlign: 'right'
  }
});
