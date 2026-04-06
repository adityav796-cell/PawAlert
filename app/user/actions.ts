'use server';

import { createClient } from '@/lib/supabase/server';
import { generateOTP, formatPhoneNumber } from '@/lib/user-auth';

interface SendOTPResult {
  success: boolean;
  message?: string;
  error?: string;
  otpSessionId?: string;
}

interface VerifyOTPResult {
  success: boolean;
  message?: string;
  error?: string;
  userId?: string;
  name?: string;
  isAdmin?: boolean;
}

// Send OTP to user's phone number
export async function sendOTP(phoneNumber: string): Promise<SendOTPResult> {
  const supabase = await createClient();

  try {
    // Validate phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Generate OTP code
    const otpCode = generateOTP();

    // Store OTP in database
    const { data, error } = await supabase
      .from('otp_sessions')
      .insert({
        phone_number: formattedPhone,
        otp_code: otpCode,
        is_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending OTP:', error);
      return { success: false, error: 'Failed to send OTP. Please try again.' };
    }

    // In production, send OTP via Twilio/SMS
    // For now, log it to console (development mode)
    console.log(
      '[OTP] Phone: ' +
        formattedPhone +
        ' | OTP Code: ' +
        otpCode +
        ' | Expires in 10 minutes'
    );

    return {
      success: true,
      message: 'OTP sent successfully. Check console for test OTP.',
      otpSessionId: data.id,
    };
  } catch (error) {
    console.error('Error in sendOTP:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

// Verify OTP and authenticate user
export async function verifyOTP(
  phoneNumber: string,
  otpCode: string
): Promise<VerifyOTPResult> {
  const supabase = await createClient();

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Get the latest OTP session for this phone number
    const { data: otpSession, error: otpError } = await supabase
      .from('otp_sessions')
      .select('*')
      .eq('phone_number', formattedPhone)
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpSession) {
      return {
        success: false,
        error: 'No active OTP session found. Request a new OTP.',
      };
    }

    // Check if OTP has expired
    const expiresAt = new Date(otpSession.expires_at);
    if (new Date() > expiresAt) {
      return {
        success: false,
        error: 'OTP has expired. Request a new one.',
      };
    }

    // Check attempt count (max 5 attempts)
    if (otpSession.attempts >= 5) {
      return {
        success: false,
        error: 'Too many attempts. Request a new OTP.',
      };
    }

    // Verify OTP code
    if (otpSession.otp_code !== otpCode) {
      // Increment attempts
      await supabase
        .from('otp_sessions')
        .update({ attempts: otpSession.attempts + 1 })
        .eq('id', otpSession.id);

      return {
        success: false,
        error: `Invalid OTP. ${5 - otpSession.attempts - 1} attempts remaining.`,
      };
    }

    // Mark OTP as verified
    await supabase
      .from('otp_sessions')
      .update({ is_verified: true, verified_at: new Date().toISOString() })
      .eq('id', otpSession.id);

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', formattedPhone)
      .single();

    let userId: string;
    let userName: string;
    let isAdmin: boolean;

    if (existingUser) {
      // User exists, use existing data
      userId = existingUser.id;
      userName = existingUser.name;
      isAdmin = existingUser.is_admin || false;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          phone_number: formattedPhone,
          name: 'User ' + formattedPhone.slice(-4),
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('Error creating user:', createError);
        return {
          success: false,
          error: 'Failed to create user account.',
        };
      }

      userId = newUser.id;
      userName = newUser.name;
      isAdmin = false;
    }

    return {
      success: true,
      message: 'Login successful!',
      userId,
      name: userName,
      isAdmin,
    };
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: 'Failed to fetch user profile' };
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: { name?: string; email?: string }
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

// Get user's own reports
export async function getUserReports(userId: string) {
  const supabase = await createClient();

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('phone_number')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found' };
    }

    const { data, error } = await supabase
      .from('animal_reports')
      .select('*')
      .eq('reporter_contact', user.phone_number)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, reports: data };
  } catch (error) {
    console.error('Error getting user reports:', error);
    return { success: false, error: 'Failed to fetch reports' };
  }
}
