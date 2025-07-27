export default function Button({ children, ...rest }) {
  return (
    <button className="px-4 py-2 bg-indigo-600 text-white rounded" {...rest}>
      {children}
    </button>
  )
}
