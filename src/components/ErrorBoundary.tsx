import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught wedding app error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('wedding_invitation_live_event_data_v1');
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 font-sans-ar text-[#2B1117]"
        >
          <div className="max-w-md w-full bg-white rounded-3xl border-2 border-[#DFCBA0] p-6 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#832E41]/10 text-[#832E41] flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-[#832E41]">عذراً، حدث خطأ أثناء تحميل الدعوة</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              يرجى إعادة تحميل الصفحة للاستمتاع بتجربة بطاقة الدعوة الملكية.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-left bg-gray-50 p-2 rounded-xl border border-gray-200 overflow-x-auto max-h-24 text-red-600">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-xl bg-[#832E41] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#6E2233] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة تحميل الصفحة</span>
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 cursor-pointer"
              >
                استعادة الإعدادات الافتراضية
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
