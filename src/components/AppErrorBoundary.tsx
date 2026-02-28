import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorScreen from './ErrorScreen';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: ''
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'フロントエンドで想定外のエラーが発生しました。'
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 予期しないエラーの原因調査用ログ
    console.error('Unexpected front-end error:', error, errorInfo);
  }

  private handleBackToLogin = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorScreen message={this.state.message} onBackToLogin={this.handleBackToLogin} />;
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
