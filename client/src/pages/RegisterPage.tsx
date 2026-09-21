import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
import { Zap, Eye, EyeOff, CheckCircle2, Shuffle, Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';

const schema = z
  .object({
    email: z.string().email('Enter a valid email address'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(24, 'Username must be under 24 characters')
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]+$/, 'Use the Random User button to create a name with letters and numbers'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { signUpWithUsername } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const randomUserNames = [
    'Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas',
    'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan', 'Jackson', 'Sebastian',
    'Jack', 'Aiden', 'Owen', 'Samuel', 'Matthew', 'Joseph', 'Levi', 'David',
    'John', 'Wyatt', 'Carter', 'Julian', 'Luke', 'Grayson', 'Isaac', 'Jayden',
    'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Evelyn', 'Harper',
    'Camila', 'Gianna', 'Abigail', 'Luna', 'Ella', 'Elizabeth', 'Sofia', 'Emily',
    'Avery', 'Mila', 'Scarlett', 'Eleanor', 'Madison', 'Layla', 'Penelope', 'Aria',
    'Alexander', 'Benjamin', 'Charles', 'Christopher', 'Dylan', 'Edward', 'Gabriel',
    'Nathan', 'Nicholas', 'Ryan', 'Thomas', 'Anthony', 'Andrew', 'Isaiah', 'Josiah',
    'Victoria', 'Grace', 'Chloe', 'Riley', 'Nora', 'Zoey', 'Hannah', 'Lily',
    'Aurora', 'Violet', 'Nova', 'Emilia', 'Stella', 'Zoe', 'Willow', 'Ivy',
    'Oliver', 'George', 'Harry', 'Arthur', 'Freddie', 'Archie', 'Oscar', 'Theo',
    'Olivia', 'Amelia', 'Isla', 'Poppy', 'Florence', 'Esme', 'Matilda', 'Evie',
    'Luca', 'Mateo', 'Santiago', 'Diego', 'Marco', 'Rafael', 'Carlos', 'Luis',
    'Sofia', 'Valentina', 'Lucia', 'Elena', 'Camila', 'Gabriela', 'Mariana', 'Alma',
    'Noah', 'Elias', 'Hugo', 'Felix', 'Leon', 'Maxim', 'Milan', 'Lars',
    'Emma', 'Clara', 'Freya', 'Elsa', 'Astrid', 'Nina', 'Lena', 'Maya',
    'Arjun', 'Rohan', 'Aarav', 'Vikram', 'Dev', 'Kabir', 'Kiran', 'Aditya',
    'Anaya', 'Priya', 'Aisha', 'Mira', 'Nisha', 'Diya', 'Zara', 'Sana',
    'Hiro', 'Kenji', 'Ren', 'Haruto', 'Yuki', 'Minjun', 'Jisoo', 'Daeho',
    'Aiko', 'Hana', 'Sakura', 'Yuna', 'Mei', 'Nari', 'Sora', 'Mina',
    'Omar', 'Youssef', 'Amir', 'Karim', 'Samir', 'Zayn', 'Bilal', 'Malik',
    'Layla', 'Amina', 'Fatima', 'Nour', 'Leila', 'Yasmin', 'Mariam', 'Zahra',
  ];

  const generateRandomUser = () => {
    const name = randomUserNames[Math.floor(Math.random() * randomUserNames.length)];
    const number = Math.floor(1000 + Math.random() * 9000);
    form.setValue('username', `${name}${number}`, { shouldValidate: true, shouldDirty: true });
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      referralCode: searchParams.get('ref') ?? '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const { error } = await signUpWithUsername(
      values.username,
      values.password,
      values.email,
      values.referralCode || undefined
    );
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('duplicate')) {
        toast.error('Username already taken. Please choose a different one.');
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
      return;
    }
    toast.success('Account created! Check your email to verify your account.');
    navigate('/dashboard');
  };

  const perks = [
    'No credit card required',
    'Instant access to all offers',
    '100+ new offers daily',
  ];

  return (
    <>
      <PageMeta title="Create Account — RewardsVerse" description="Join RewardsVerse and start earning rewards" />
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap size={14} className="text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">RewardsVerse</span>
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
              <p className="text-sm text-muted-foreground">Start earning rewards in seconds</p>
            </div>

            {/* Perks */}
            <div className="mb-5 space-y-1.5">
              {perks.map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={13} className="text-primary shrink-0" />
                  {p}
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground">Email address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input type="email" placeholder="you@example.com" autoComplete="email" className="px-3 pl-9" {...field} />
                          </div>
                        </FormControl>
                        <p className="text-[11px] text-muted-foreground">We’ll send a verification link to this address.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground">Random User <span className="text-primary">(required)</span></FormLabel>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <FormControl>
                            <Input placeholder="Click Random User" readOnly className="px-3 bg-muted/30" {...field} />
                          </FormControl>
                          <Button type="button" variant="outline" onClick={generateRandomUser} className="w-full shrink-0 gap-1.5 sm:w-auto" aria-label="Generate random user">
                            <Shuffle size={14} /> Random User
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Required: an American-style name with letters and numbers.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              className="px-3 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="px-3"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground">
                          Referral Code{' '}
                          <span className="text-muted-foreground font-normal">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="ABC12345" className="px-3 uppercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full mt-2"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
                  </Button>
                </form>
              </Form>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
