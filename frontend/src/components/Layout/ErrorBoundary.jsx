import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg m-4">
          <h2 className="text-lg font-semibold">เกิดข้อผิดพลาด</h2>
          <p>
            ไม่สามารถแสดงประวัติได้:{" "}
            {this.state.error?.message || "Unknown error"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            ลองใหม่
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
