import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import api from '../services/api';

export default function Onboarding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    setIsLoading(true);
    setError('');
    try {
      await authService.sendOtp(phone);
      setOtpSent(true);
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setIsLoading(true);
    setError('');
    try {
      const dealer = await login(phone, otp);
      if (dealer.onboarding_completed) {
        navigate('/');
      } else {
        nextStep();
      }
    } catch {
      setError('Incorrect or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Verify Phone Number</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter Mobile Number"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setOtpSent(false); setError(''); }}
                className="flex-1"
              />
              <Button variant="secondary" onClick={handleSendOtp} disabled={phone.length < 10 || isLoading}>
                {otpSent ? 'Resend' : 'Send OTP'}
              </Button>
            </div>
            {otpSent && (
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setError(''); }}
              />
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full" onClick={handleVerifyOtp} disabled={!otpSent || !otp || isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dealership Details</h3>
            <Input placeholder="Dealership Name" />
            <Input placeholder="City" />
            <Input placeholder="Brands Sold (e.g. Hyundai, Maruti)" />
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Continue</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Brand Colors</h3>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm mb-1">Primary Color</label>
                <input type="color" defaultValue="#1877F2" className="w-16 h-10 rounded border" />
              </div>
              <div>
                <label className="block text-sm mb-1">Secondary Color</label>
                <input type="color" defaultValue="#1A1A2E" className="w-16 h-10 rounded border" />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Continue</Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Connect Platforms</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-between">
                <span>Facebook Page</span> <span className="text-blue-600">Connect</span>
              </Button>
              <Button variant="secondary" className="w-full justify-between">
                <span>Instagram Business</span> <span className="text-blue-600">Connect</span>
              </Button>
              <Button variant="secondary" className="w-full justify-between">
                <span>Google My Business</span> <span className="text-blue-600">Connect</span>
              </Button>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Skip or Continue</Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-bold text-green-600">🎉 You're all set!</h3>
            <p className="text-gray-500">Let's generate your first post.</p>
            <Button className="w-full mt-4" onClick={() => {
              api.post('/dealer/onboarding/complete').catch(console.error);
              navigate('/');
            }}>
              Go to Dashboard
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-8">Cardeko Social AI</h1>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
          <div className="w-full bg-gray-200 h-2 mt-4 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300" 
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}
