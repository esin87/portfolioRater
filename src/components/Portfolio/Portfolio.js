import React from 'react';
import { Link } from 'react-router-dom';
import './Portfolio.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ConfirmDelete from '../ConfirmDelete/ConfirmDelete';

class Portfolio extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			port: null,
			show: false,
			commentIndex: null,
			deleteType: null
		};
	}
	deletePortfolio = e => {
		fetch(
			`https://portfolio-rater.herokuapp.com/api/portfolios/delete/${e.target.id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		).then(
			setTimeout(() => {
				this.props.history.push('/');
			}, 125)
		);
	};

	like = (id, oldRating) => {
		let rating = oldRating + 1;
		const data = { rating };
		fetch('https://portfolio-rater.herokuapp.com/api/portfolios/update/' + id, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			mode: 'cors',
			body: JSON.stringify(data)
		});
		setTimeout(() => {
			this.refresh(id);
		}, 125);
	};

	dislike = (id, oldRating) => {
		let rating = oldRating - 1;
		const data = { rating };
		fetch('https://portfolio-rater.herokuapp.com/api/portfolios/update/' + id, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			mode: 'cors',
			body: JSON.stringify(data)
		});
		setTimeout(() => {
			this.refresh(id);
		}, 125);
	};

	refresh = () => {
		fetch(
			'https://portfolio-rater.herokuapp.com/api/portfolios/' +
				this.state.port._id
		)
			.then(response => response.json())
			.then(response => {
				this.setState({
					port: response
				});
			})
			.catch(console.error);
	};

	addComment = event => {
		event.preventDefault();
		if (this.props.user) {
			let newComments = [...this.state.port.posts];
			newComments.push({
				text: event.target.comment.value,
				userId: this.props.user._id || 'default'
			});
			let data = { posts: newComments };
			fetch(
				'https://portfolio-rater.herokuapp.com/api/portfolios/update/' +
					this.state.port._id,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					mode: 'cors',
					body: JSON.stringify(data)
				}
			);
			setTimeout(() => {
				this.refresh();
			}, 125);
		} else {
			this.props.handleShowLogin();
		}
	};

	deleteComment = e => {
		const index = e.target.getAttribute('data-index');
		let newComments = this.state.port.posts;
		newComments.splice(index, 1);
		const data = { posts: newComments };
		fetch(
			'https://portfolio-rater.herokuapp.com/api/portfolios/update/' +
				this.state.port._id,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				mode: 'cors',
				body: JSON.stringify(data)
			}
		).then(this.handleHide());
		setTimeout(() => {
			this.refresh();
		}, 125);
	};

	componentDidMount() {
		fetch(
			'https://portfolio-rater.herokuapp.com/api/portfolios/' +
				this.props.match.params.id
		)
			.then(response => response.json())
			.then(data => this.setState({ port: data }))
			.catch(console.error);
	}
	handleHide = () => {
		this.setState({
			show: false
		});
	};

	handleShow = e => {
		if (e.target.getAttribute('data-index')) {
			this.setState({
				deleteType: 'comment',
				commentIndex: e.target.getAttribute('data-index')
			});
		} else {
			this.setState({ deleteType: 'portfolio' });
		}
		this.setState({
			show: true
		});
	};

	render() {
		if (this.state.port !== null) {
			const { port, show } = this.state;
			let comments = port.posts.map((comment, index) => {
				if (this.props.user && this.props.user._id === comment.userId) {
					return (
						<Form key={comment.text + comment.userId}>
							<li className="comments">
								{comment.text}&nbsp;&nbsp;&nbsp;
								<Button
									data-id={port._id}
									data-index={index}
									onClick={this.handleShow}
									className="btn btn-secondary"
								>
									Delete
								</Button>
							</li>
						</Form>
					);
				} else {
					return (
						<li key={comment.text + comment.userId} className="comments">
							{comment.text}
						</li>
					);
				}
			});
			return (
				<div key={port._id} className="portfolio single">
					<Modal show={show}>
						<ConfirmDelete
							id={port._id}
							index={this.state.commentIndex}
							comment={this.state.port.posts[this.state.commentIndex]}
							handleShow={this.handleShow}
							handleHide={this.handleHide}
							deletePortfolio={this.deletePortfolio}
							deleteComment={this.deleteComment}
							type={this.state.deleteType}
						/>
					</Modal>
					<img src={port.imageUrl} alt={port.title} />

					<br />
					<div className="content">
						<h3>{port.name}</h3>
						<h4>{port.title}</h4>
						<p>{port.description}</p>
						<ul>{comments}</ul>
						<Form onSubmit={this.addComment}>
							<Form.Row>
								<Form.Group>
									<Form.Label htmlFor="comment">Add a comment: </Form.Label>
									<Form.Control type="text" id="comment" name="comment" />
									<br />
									<Button className="btn btn-secondary" type="submit">
										Submit
									</Button>
								</Form.Group>
							</Form.Row>
						</Form>
					</div>
					<div className="vote-buttons">
						<Button
							onClick={() => this.like(port._id, port.rating)}
							className="btn btn-success"
						></Button>
						<Button className="btn btn-secondary">{port.rating}</Button>

						<Button
							onClick={() => this.dislike(port._id, port.rating)}
							className="btn btn-danger down"
						></Button>
					</div>
					<div className="port-buttons">
						<Button href={port.link} className="btn btn-secondary btn-port">
							Visit portfolio
						</Button>

						{this.props.user && this.props.user._id === port.userId && (
							<div>
								<Link to={'/update/' + port._id}>
									<Button id={port._id} className="btn btn-secondary btn-port">
										Edit
									</Button>
								</Link>
								<Button
									id={port._id}
									onClick={this.handleShow}
									className="btn btn-secondary btn-port"
								>
									Delete
								</Button>
							</div>
						)}
					</div>
				</div>
			);
		} else {
			return <h1>Portfolio not found?</h1>;
		}
	}
}

export default Portfolio;
