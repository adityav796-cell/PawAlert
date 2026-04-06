'use client';

import { useState } from 'react';
import { Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendOTP, verifyOTP } from '@/lib/user-actions';
import { setUserSession } from '@/lib/user-auth';
import { cn } from '@/lib/utils';

interface UserLoginScreenProps {
  onLoginSuccess: () => void;
}

export function UserLoginScreen({ onLoginSuccess }: UserLoginScreenProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await sendOTP(phoneNumber);

    setLoading(false);

    if (result.success) {
      setOtpSessionId(result.otpSessionId || '');
      setStep('otp');
      setSuccessMessage('OTP sent successfully!');
      // For testing, show the OTP in a toast (in production, remove this)
      setOtp('');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await verifyOTP(phoneNumber, otp);

    setLoading(false);

    if (result.success) {
      // Set user session
      setUserSession({
        phoneNumber,
        userId: result.userId!,
        name: result.name!,
        isAdmin: result.isAdmin || false,
        loginTime: Date.now(),
      });

      setSuccessMessage('Login successful!');
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } else {
      setError(result.error || 'Failed to verify OTP');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-500 text-white p-3 rounded-full">
              <Phone className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PawAlert</h1>
          <p className="text-gray-600">Sign in with your phone number</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Phone Input Step */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">+91</span>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength="10"
                  disabled={loading}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                10-digit Indian phone number
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || phoneNumber.length !== 10}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-center text-xs text-gray-600">
              We&apos;ll send you a 6-digit code for verification
            </p>
          </form>
        )}

        {/* OTP Input Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                disabled={loading}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-gray-500 mt-2">
                Sent to +91 {phoneNumber}
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
              <CheckCircle className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
              }}
              disabled={loading}
              className="w-full"
            >
              Use Different Number
            </Button>

            <p className="text-center text-xs text-gray-600">
              Didn&apos;t receive the code? Check your console for test OTP
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
