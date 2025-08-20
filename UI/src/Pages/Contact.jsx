import React, { useState } from "react";

const Contact = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you can handle form submission (e.g., send to API)
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h2>
                <p className="text-gray-500 mb-8">
                    Have a question or want to work together? Fill out the form below and we’ll get back to you soon.
                </p>
                {submitted ? (
                    <div className="text-green-600 text-lg font-semibold">
                        Thank you for reaching out! We’ll get back to you soon.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1" htmlFor="name">
                                Name
                            </label>
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1" htmlFor="message">
                                Message
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
                                id="message"
                                name="message"
                                rows={5}
                                value={form.message}
                                onChange={handleChange}
                                required
                                placeholder="How can we help you?"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                        >
                            Send Message
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Contact;