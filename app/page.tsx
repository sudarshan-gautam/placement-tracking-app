'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  CheckCircle, 
  Award, 
  BookOpen, 
  Calendar, 
  LineChart, 
  Users,
  School,
  GraduationCap,
  TrendingUp,
  Building,
  Star,
  Shield
} from 'lucide-react';
import { navigateToSignUp, navigateWithReload } from '@/lib/navigation';
import { ClientOnly } from '@/components/ui/client-only';

// Feature data
const features = [
  {
    title: 'Qualification Tracking',
    description: 'Track and manage your professional qualifications and certifications in one place',
    icon: Award,
  },
  {
    title: 'Competency Framework',
    description: 'Align your skills with industry standards and track your professional growth',
    icon: BookOpen,
  },
  {
    title: 'Session Management',
    description: 'Plan, record, and reflect on your teaching sessions with comprehensive tools',
    icon: Calendar,
  },
  {
    title: 'Research Integration',
    description: 'Connect your practice with the latest educational research and evidence',
    icon: LineChart,
  },
  {
    title: 'Progress Analytics',
    description: 'Visualize your professional development journey with detailed analytics',
    icon: TrendingUp,
  },
  {
    title: 'Professional Network',
    description: 'Connect with peers and mentors in your professional development journey',
    icon: Users,
  }
];

// Process steps
const steps = [
  {
    title: 'Sign Up',
    description: 'Create your professional account and set up your profile',
    icon: Users,
  },
  {
    title: 'Build Profile',
    description: 'Add your qualifications, experiences, and professional goals',
    icon: GraduationCap,
  },
  {
    title: 'Track Progress',
    description: 'Record your sessions and monitor your development',
    icon: LineChart,
  },
  {
    title: 'Grow Professionally',
    description: 'Achieve your career goals with structured development',
    icon: TrendingUp,
  }
];

// Statistics
const stats = [
  { label: 'Active Users', value: '10,000+' },
  { label: 'Institutions', value: '500+' },
  { label: 'Certifications Tracked', value: '25,000+' },
  { label: 'Professional Growth Rate', value: '94%' }
];

// Benefits data
const benefits = [
  {
    title: 'For Practitioners',
    description: 'Track your professional growth, manage qualifications, and align with industry standards',
    icon: Users
  },
  {
    title: 'For Supervisors',
    description: 'Monitor team progress, provide feedback, and support professional development',
    icon: Shield
  },
  {
    title: 'For Institutions',
    description: 'Ensure compliance, maintain standards, and foster professional excellence',
    icon: Building
  },
  {
    title: 'For Professional Development',
    description: 'Evidence-based growth, structured learning paths, and continuous improvement',
    icon: TrendingUp
  }
];

// Testimonials data
const testimonials = [
  {
    quote: "This platform has transformed how I track my professional development. It's intuitive and comprehensive.",
    author: "Sarah Johnson",
    role: "Senior Educator",
    institution: "Springfield Academy"
  },
  {
    quote: "The research integration feature helps us maintain evidence-based practices across our institution.",
    author: "Dr. Michael Chen",
    role: "Department Head",
    institution: "Education Institute"
  },
  {
    quote: "Managing our team's professional development has never been easier. The insights are invaluable.",
    author: "Emma Thompson",
    role: "Professional Development Lead",
    institution: "Learning Center"
  }
];

// Institution types
const institutions = [
  {
    type: 'Educational Institutions',
    examples: ['Universities', 'Schools', 'Training Centers'],
    icon: School
  },
  {
    type: 'Professional Bodies',
    examples: ['Certification Authorities', 'Industry Associations', 'Research Institutions'],
    icon: Award
  },
  {
    type: 'Development Programs',
    examples: ['Structured Pathways', 'Mentorship Programs', 'Research Opportunities'],
    icon: GraduationCap
  }
];

export default function LandingPage() {
  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigateWithReload(path);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Track Your Professional Development Journey
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A comprehensive platform for educational practitioners to manage qualifications, track competencies, and grow professionally.
              </p>
              <ClientOnly>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="/auth/signup" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToSignUp();
                    }}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </div>
              </ClientOnly>
              <div className="mt-8">
                <p className="text-sm text-gray-600">
                  Join thousands of educational practitioners on their professional development journey
                </p>
              </div>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <div className="relative h-[400px] w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder-hero.jpg"
                  alt="Professional Development"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={(e) => {
                    // Fallback to a colored background if image fails to load
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#f3f4f6';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Features for Your Growth
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to track, manage, and accelerate your professional development
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with your professional development journey in four simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <step.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-blue-100" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefits for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Supporting professional development at every level
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-8 border border-gray-200 hover:border-blue-500 transition-colors"
              >
                <benefit.icon className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real experiences from educational professionals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-8 shadow-sm relative"
              >
                <Star className="absolute top-4 right-4 h-6 w-6 text-yellow-400" />
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Partnerships */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Development Pathways
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Partner with leading institutions and professional bodies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {institutions.map((institution, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-8 border border-gray-200"
              >
                <institution.icon className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {institution.type}
                </h3>
                <ul className="space-y-3">
                  {institution.examples.map((example, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-lg text-blue-100">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Professional Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of educational practitioners who are already tracking and advancing their professional development.
          </p>
          <ClientOnly>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/register" 
                onClick={(e) => handleNavigation(e, '/auth/signup')}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a 
                href="/contact" 
                onClick={(e) => handleNavigation(e, '/contact')}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Contact Sales
              </a>
            </div>
          </ClientOnly>
        </div>
      </section>
    </div>
  );
} 